import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin/nexus-layout/Sidebar';
import { Topbar } from '@/components/admin/nexus-layout/Topbar';
import { NexusAdminConfigProvider } from '@/contexts/nexus-admin-config';
import { adminMenuItems } from './menu';
import '@/styles/admin-nexus/app.css';

export default async function NexusAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const userName = profile?.full_name || user.email || 'Admin';

  return (
    <NexusAdminConfigProvider>
      <div className="size-full">
        <div className="flex">
          <Sidebar menuItems={adminMenuItems} siteName={siteName} />
          <div className="flex h-screen min-w-0 grow flex-col overflow-auto">
            <Topbar userName={userName} />
            <div id="layout-content">{children}</div>
          </div>
        </div>
      </div>
    </NexusAdminConfigProvider>
  );
}
