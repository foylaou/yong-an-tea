import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { richMenuFormSchema } from '@/lib/validations/line-richmenu';
import { getLineBotSettings } from '@/lib/line-bot';
import { deleteRichMenu, deleteRichMenuAlias, toAliasId } from '@/lib/line-richmenu';

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = richMenuFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '格式不正確', details: parsed.error.flatten() }, { status: 400 });
  }

  // Editing doesn't touch LINE by itself — the admin has to hit "套用" again
  // to push the change live, same as any other draft-then-apply flow.
  const { data, error } = await supabase
    .from('line_richmenus')
    .update({
      name: parsed.data.name,
      chat_bar_text: parsed.data.chat_bar_text,
      template: parsed.data.template,
      buttons: parsed.data.buttons,
      image_url: parsed.data.image_url,
      target: parsed.data.target,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const isConflict = error.code === '23505';
    return NextResponse.json({ error: isConflict ? '這個名稱已經被使用了' : error.message }, { status: isConflict ? 409 : 500 });
  }

  return NextResponse.json({ richmenu: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const db = createAdminClient();
  const { data: row } = await db.from('line_richmenus').select('name, line_richmenu_id').eq('id', id).single();

  if (row?.line_richmenu_id) {
    // Best-effort — a menu deleted directly from LINE's own console
    // shouldn't block deleting our record of it.
    const botSettings = await getLineBotSettings().catch(() => null);
    if (botSettings?.channelAccessToken) {
      await deleteRichMenuAlias(toAliasId(row.name), botSettings.channelAccessToken).catch(() => {});
      await deleteRichMenu(row.line_richmenu_id, botSettings.channelAccessToken).catch(() => {});
    }
  }

  const { error } = await supabase.from('line_richmenus').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
