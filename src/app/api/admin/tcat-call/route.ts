import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callTcat, clearTcatCache } from '@/lib/tcat';

async function verifyAdmin(supabase: any) {
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

/**
 * POST — 呼叫黑貓取件 (Call)
 * 預約司機上門收貨
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  // Get sender settings from site_settings
  const adminDb = createAdminClient();
  const { data: settingsRows } = await adminDb
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'tcat_sender_name',
      'tcat_sender_phone',
      'tcat_sender_mobile',
      'tcat_sender_address',
    ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRows || []) {
    settings[row.key] = String(row.value || '');
  }

  // Use body overrides or fall back to settings
  const contactName = body.contactName || settings.tcat_sender_name;
  const contactMobile = stripPhone(body.contactMobile || settings.tcat_sender_mobile);
  const contactAddress = body.contactAddress || settings.tcat_sender_address;

  if (!contactName || !contactMobile || !contactAddress) {
    return NextResponse.json(
      { error: '聯絡人資訊不完整（姓名、手機、地址），請至後台系統設定 → 物流設定填寫' },
      { status: 400 },
    );
  }

  // Parse phone into area + number if provided
  const phone = body.contactPhone || settings.tcat_sender_phone || '';
  const { area, number } = parsePhone(phone);

  clearTcatCache();

  try {
    const result = await callTcat({
      contactName,
      contactTelArea: body.contactTelArea || area,
      contactTelNumber: body.contactTelNumber || number,
      contactMobile,
      contactAddress,
      normalQuantity: body.normalQuantity ?? 1,
      coldQuantity: body.coldQuantity ?? 0,
      freezeQuantity: body.freezeQuantity ?? 0,
      memo: body.memo || '',
    });

    if (result.IsOK !== 'Y') {
      return NextResponse.json(
        { error: result.Message || '呼叫黑貓取件失敗' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: '已成功呼叫黑貓取件' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '呼叫黑貓取件失敗' },
      { status: 500 },
    );
  }
}

function stripPhone(phone: string): string {
  return (phone || '').replace(/[-\s()+]/g, '');
}

/** Parse "02-12345678" or "(02)12345678" into area + number */
function parsePhone(phone: string): { area: string; number: string } {
  const clean = stripPhone(phone);
  // Match leading area code (2-4 digits starting with 0)
  const match = clean.match(/^(0\d{1,3})(\d+)$/);
  if (match) {
    return { area: match[1], number: match[2] };
  }
  return { area: '', number: clean };
}
