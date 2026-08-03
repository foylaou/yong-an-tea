import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestOtp } from '@/lib/email-otp';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const result = await requestOtp(user.email, 'bind_phone');

  if (!result.success) {
    return NextResponse.json({ error: result.error || '驗證碼寄送失敗' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
