import nodemailer from 'nodemailer';
import { createAdminClient } from './supabase/admin';

interface SmtpConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_name: string;
  smtp_from_email: string;
}

export async function getSmtpSettings(): Promise<SmtpConfig | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'smtp_host',
      'smtp_port',
      'smtp_user',
      'smtp_pass',
      'smtp_from_name',
      'smtp_from_email',
    ]);

  if (error) {
    console.error('Failed to fetch SMTP settings:', error);
    return null;
  }

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
    return null;
  }

  return {
    smtp_host: settings.smtp_host,
    smtp_port: Number(settings.smtp_port) || 587,
    smtp_user: settings.smtp_user,
    smtp_pass: settings.smtp_pass,
    smtp_from_name: settings.smtp_from_name || '',
    smtp_from_email: settings.smtp_from_email || settings.smtp_user,
  };
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const config = await getSmtpSettings();
    if (!config) {
      console.warn('SMTP 未設定，無法發送郵件');
      return { success: false, error: 'SMTP 未設定' };
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    });

    await transporter.sendMail({
      from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    return { success: true };
  } catch (err) {
    console.error('sendEmail error:', err);
    const message = err instanceof Error ? err.message : '郵件發送失敗';
    return { success: false, error: message };
  }
}
