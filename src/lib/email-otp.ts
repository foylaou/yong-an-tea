import { createAdminClient } from './supabase/admin';
import { sendEmail } from './email';
import { phoneBindOtpEmail } from './email-templates';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export type OtpPurpose = 'bind_phone';

export interface RequestOtpResult {
  success: boolean;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Sends a fresh OTP to `email`. Any previous unconsumed code for the same
 * email+purpose is superseded (not accumulated) — verifyOtp only ever looks
 * at the most recent row.
 */
export async function requestOtp(email: string, purpose: OtpPurpose = 'bind_phone'): Promise<RequestOtpResult> {
  const supabase = createAdminClient();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  const { error } = await supabase.from('email_otps').insert({
    email,
    code,
    purpose,
    expires_at: expiresAt,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const emailResult = await sendEmail({
    to: email,
    subject: '驗證碼 — 永安の茶',
    html: phoneBindOtpEmail(code),
  });

  if (!emailResult.success) {
    return { success: false, error: emailResult.error || '驗證碼寄送失敗' };
  }

  return { success: true };
}

export async function verifyOtp(email: string, code: string, purpose: OtpPurpose = 'bind_phone'): Promise<VerifyOtpResult> {
  const supabase = createAdminClient();

  const { data: record, error } = await supabase
    .from('email_otps')
    .select('id, code, expires_at, consumed_at, attempts')
    .eq('email', email)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !record) {
    return { success: false, error: '請先取得驗證碼' };
  }

  if (record.consumed_at) {
    return { success: false, error: '此驗證碼已使用，請重新取得' };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, error: '驗證碼已過期，請重新取得' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: '嘗試次數過多，請重新取得驗證碼' };
  }

  if (record.code !== code) {
    await supabase
      .from('email_otps')
      .update({ attempts: record.attempts + 1 })
      .eq('id', record.id);
    return { success: false, error: '驗證碼錯誤' };
  }

  await supabase.from('email_otps').update({ consumed_at: new Date().toISOString() }).eq('id', record.id);

  return { success: true };
}
