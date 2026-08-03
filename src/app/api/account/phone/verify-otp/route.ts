import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { verifyOtp } from '@/lib/email-otp';

const verifyPhoneSchema = z.object({
  code: z.string().length(6, '驗證碼為 6 位數'),
  phone: z.string().regex(/^0[0-9]{8,9}$/, '請輸入有效的台灣電話號碼'),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const body = await request.json();
  const result = verifyPhoneSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const otpResult = await verifyOtp(user.email, result.data.code, 'bind_phone');

  if (!otpResult.success) {
    return NextResponse.json({ error: otpResult.error || '驗證失敗' }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ phone: result.data.phone })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, phone: result.data.phone });
}
