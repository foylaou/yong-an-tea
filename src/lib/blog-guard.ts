import { createAdminClient } from './supabase/admin';

export async function isBlogEnabled(): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'blog_enabled')
    .single();
  return data?.value !== 'false';
}
