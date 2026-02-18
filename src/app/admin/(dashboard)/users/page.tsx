import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import UserTable from '@/components/admin/users/UserTable';

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  // Fetch auth users
  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });

  // Fetch profiles — only admins
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'admin');

  const adminIds = new Set((profiles || []).map((p: any) => p.id));
  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  );

  // Merge — only admin users
  const merged = (authUsers || [])
    .filter((u: any) => adminIds.has(u.id))
    .map((u: any) => ({
      id: u.id,
      email: u.email || '',
      full_name: profileMap.get(u.id)?.full_name || '',
      role: profileMap.get(u.id)?.role || 'admin',
      created_at: u.created_at,
    }))
    .sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <UserTable
      initialUsers={merged}
      currentUserId={user?.id || ''}
      mode="admin"
    />
  );
}
