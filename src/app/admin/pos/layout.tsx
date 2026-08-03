import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NexusAdminConfigProvider } from '@/contexts/nexus-admin-config';
import '@/styles/admin-nexus/app.css';
import { PosTopbar } from '@/components/admin/pos/PosTopbar';

/**
 * Standalone full-screen shell for 銷售模式 (POS) — deliberately outside
 * the (nexus) route group so it doesn't inherit the admin Sidebar/Topbar,
 * maximizing screen space on the tablet this is designed for.
 */
export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const [{ data: profile }, { data: siteNameRow }] = await Promise.all([
    supabase.from('profiles').select('role, full_name').eq('id', user.id).single(),
    supabase.from('site_settings').select('value').eq('key', 'site_name').single(),
  ]);

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  const siteName = (siteNameRow?.value as string) || '永安茶園';

  return (
    <NexusAdminConfigProvider>
      <div className="bg-base-200 flex h-screen flex-col overflow-hidden">
        <PosTopbar siteName={siteName} />
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </NexusAdminConfigProvider>
  );
}
