import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyOtp } from '@/lib/email-otp';

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

const confirmSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, '驗證碼為 6 位數'),
  walk_in_customer_id: z.string().uuid().optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = confirmSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const { email, code, walk_in_customer_id, phone } = result.data;

  const otpResult = await verifyOtp(email, code, 'bind_phone');
  if (!otpResult.success) {
    return NextResponse.json({ error: otpResult.error || '驗證失敗' }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: listResult } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const authUser = listResult?.users?.find((u: { email?: string }) => u.email === email);

  if (!authUser) {
    return NextResponse.json({ error: '查無此 email 對應的會員' }, { status: 404 });
  }

  const { data: memberProfile } = await adminClient
    .from('profiles')
    .select('id, full_name, phone')
    .eq('id', authUser.id)
    .single();

  if (!memberProfile) {
    return NextResponse.json({ error: '查無此會員資料' }, { status: 404 });
  }

  // Sync the verified phone onto the member's own profile if they haven't
  // self-service bound one yet — the POS OTP check is just as valid a proof.
  if (phone && !memberProfile.phone) {
    await adminClient.from('profiles').update({ phone }).eq('id', memberProfile.id);
  }

  if (walk_in_customer_id) {
    await adminClient
      .from('customers')
      .update({ profile_id: memberProfile.id, phone: phone || memberProfile.phone })
      .eq('id', walk_in_customer_id);
  }

  return NextResponse.json({
    member: {
      profile_id: memberProfile.id,
      full_name: memberProfile.full_name,
      email,
      phone: phone || memberProfile.phone,
    },
  });
}
