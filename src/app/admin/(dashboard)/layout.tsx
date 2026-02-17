import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

export default async function AdminLayout({
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
    supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'site_name')
      .single(),
  ]);

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  const siteName = (siteNameRow?.value as string) || 'Helendo';

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar siteName={siteName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader userName={profile?.full_name || user.email || 'Admin'} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
