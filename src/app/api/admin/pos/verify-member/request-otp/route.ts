import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requestOtp } from '@/lib/email-otp';

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

const requestSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = requestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: '請輸入有效的 Email' }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: matchedUser } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const authUser = matchedUser?.users?.find((u: { email?: string }) => u.email === result.data.email);

  if (!authUser) {
    return NextResponse.json({ error: '查無此 email 對應的會員' }, { status: 404 });
  }

  const otpResult = await requestOtp(result.data.email, 'bind_phone');
  if (!otpResult.success) {
    return NextResponse.json({ error: otpResult.error || '驗證碼寄送失敗' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
