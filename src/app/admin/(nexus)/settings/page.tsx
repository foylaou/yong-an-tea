import { createClient } from '@/lib/supabase/server';
import { SettingsTabs } from '@/components/admin/nexus-settings/SettingsTabs';

export default async function SettingsPage() {
  const supabase = await createClient();

  // protected_settings (SMTP password, payment/webhook signing keys, LINE
  // tokens) has admin-only RLS — this page is only reachable by admins
  // already, so the session client can read it directly, no admin client
  // needed here.
  const [{ data: publicRows }, { data: protectedRows }] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase.from('protected_settings').select('*'),
  ]);

  // Group settings by group: { general: { site_name: "...", ... }, ... }
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const row of [...(publicRows || []), ...(protectedRows || [])]) {
    if (!grouped[row.group]) {
      grouped[row.group] = {};
    }
    grouped[row.group][row.key] = row.value;
  }

  return <SettingsTabs initialSettings={grouped} />;
}
