import { createClient } from '@/lib/supabase/server';
import SettingsTabs from '@/components/admin/settings/SettingsTabs';

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_settings')
    .select('*');

  // Group settings by group: { general: { site_name: "...", ... }, ... }
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const row of data || []) {
    if (!grouped[row.group]) {
      grouped[row.group] = {};
    }
    grouped[row.group][row.key] = row.value;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">系統設定</h1>
      </div>
      <SettingsTabs initialSettings={grouped} />
    </div>
  );
}
