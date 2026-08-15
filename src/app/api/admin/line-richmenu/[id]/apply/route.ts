import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getLineBotSettings } from '@/lib/line-bot';
import {
  createRichMenu,
  uploadRichMenuImage,
  linkRichMenuToUser,
  setDefaultRichMenu,
  deleteRichMenu,
  upsertRichMenuAlias,
  buildAreasFromTemplate,
  templateCellCount,
  toAliasId,
  resolveLiffAction,
  RICHMENU_SIZE,
  type RichMenuAction,
} from '@/lib/line-richmenu';
import type { RichMenuActionData } from '@/lib/validations/line-richmenu';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return user;
}

interface RichMenuRow {
  id: string;
  name: string;
  chat_bar_text: string;
  template: string;
  buttons: { label: string; action: RichMenuActionData }[];
  image_url: string | null;
  target: 'all' | 'admin';
  line_richmenu_id: string | null;
}

/**
 * Pushes a configured line_richmenus row live: create on LINE, upload its
 * image, point its alias at it, apply to the target audience, then clean up
 * whatever this same row had live before. Called every time the admin hits
 * "套用" — editing a draft never touches LINE by itself.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const db = createAdminClient();
  const { data: row } = await db.from('line_richmenus').select('*').eq('id', id).single<RichMenuRow>();
  if (!row) {
    return NextResponse.json({ error: '找不到這個選單' }, { status: 404 });
  }
  if (!row.image_url) {
    return NextResponse.json({ error: '請先上傳選單圖片' }, { status: 400 });
  }

  const botSettings = await getLineBotSettings().catch(() => null);
  if (!botSettings?.enabled) {
    return NextResponse.json({ error: 'LINE 官方帳號尚未啟用，請至後台設定' }, { status: 400 });
  }
  const { channelAccessToken } = botSettings;

  // Resolve each button's action into what LINE actually wants. richmenuswitch
  // needs the *target* menu's alias, which only exists once that menu has
  // been applied at least once — can't switch to something that was never
  // pushed live.
  const resolvedActions: RichMenuAction[] = [];
  for (const button of row.buttons.slice(0, templateCellCount(row.template))) {
    const action = button.action;
    if (action.type === 'none') continue;
    if (action.type === 'richmenuswitch') {
      const { data: target } = await db
        .from('line_richmenus')
        .select('line_richmenu_id')
        .eq('name', action.targetMenuName)
        .single();
      if (!target?.line_richmenu_id) {
        return NextResponse.json(
          { error: `切換目標選單「${action.targetMenuName}」還沒套用過，請先套用該選單` },
          { status: 400 }
        );
      }
      resolvedActions.push({
        type: 'richmenuswitch',
        richMenuAliasId: toAliasId(action.targetMenuName),
        data: `switch:${action.targetMenuName}`,
      });
    } else if (action.type === 'liff') {
      if (!botSettings.liffId) {
        return NextResponse.json({ error: '請先在「基本設定」填 LIFF ID，才能使用 LIFF 頁面按鈕' }, { status: 400 });
      }
      resolvedActions.push(resolveLiffAction(action.path, botSettings.liffId));
    } else {
      resolvedActions.push(action);
    }
  }

  if (!resolvedActions.length) {
    return NextResponse.json({ error: '請至少設定一個按鈕動作' }, { status: 400 });
  }

  const imageRes = await fetch(row.image_url).catch(() => null);
  if (!imageRes?.ok) {
    return NextResponse.json({ error: '無法下載選單圖片' }, { status: 400 });
  }
  const contentType = imageRes.headers.get('content-type') || 'image/png';
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
  if (imageBuffer.byteLength > 1024 * 1024) {
    return NextResponse.json({ error: '圖片超過 LINE 限制的 1MB' }, { status: 400 });
  }

  try {
    const richMenuId = await createRichMenu(
      {
        size: RICHMENU_SIZE,
        selected: false,
        name: row.name,
        chatBarText: row.chat_bar_text,
        areas: buildAreasFromTemplate(row.template, resolvedActions),
      },
      channelAccessToken
    );

    await uploadRichMenuImage(richMenuId, imageBuffer, contentType, channelAccessToken);

    // Point this menu's own alias at the new ID *before* touching audience
    // assignment or deleting the old one, so any other menu's
    // richmenuswitch pointing here never has a dangling window.
    const aliasId = toAliasId(row.name);
    await upsertRichMenuAlias(aliasId, richMenuId, channelAccessToken);

    let linkedCount: number | undefined;
    let totalAdmins: number | undefined;

    if (row.target === 'all') {
      await setDefaultRichMenu(richMenuId, channelAccessToken);
    } else {
      const { data: admins } = await db.from('profiles').select('line_user_id').eq('role', 'admin').not('line_user_id', 'is', null);
      const results = await Promise.allSettled(
        (admins ?? []).map((a) => linkRichMenuToUser(a.line_user_id as string, richMenuId, channelAccessToken))
      );
      linkedCount = results.filter((r) => r.status === 'fulfilled').length;
      totalAdmins = admins?.length ?? 0;
    }

    if (row.line_richmenu_id) {
      await deleteRichMenu(row.line_richmenu_id, channelAccessToken).catch(() => {});
    }

    await db
      .from('line_richmenus')
      .update({ line_richmenu_id: richMenuId, applied_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ ok: true, richMenuId, linkedCount, totalAdmins });
  } catch (err) {
    console.error('[line-richmenu apply] failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '套用失敗' }, { status: 500 });
  }
}
