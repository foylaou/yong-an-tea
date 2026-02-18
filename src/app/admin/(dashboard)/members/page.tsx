import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import UserTable from '@/components/admin/users/UserTable';

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  // Fetch auth users
  const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });

  // Fetch profiles — only customers (members)
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, full_name, role, line_user_id')
    .eq('role', 'customer');

  const memberIds = new Set((profiles || []).map((p: any) => p.id));
  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  );

  // Merge — only customer users
  const merged = (authUsers || [])
    .filter((u: any) => memberIds.has(u.id))
    .map((u: any) => ({
      id: u.id,
      email: u.email || '',
      full_name: profileMap.get(u.id)?.full_name || '',
      role: 'customer' as string,
      created_at: u.created_at,
      line_user_id: profileMap.get(u.id)?.line_user_id || '',
    }))
    .sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <UserTable
      initialUsers={merged}
      currentUserId={user?.id || ''}
      mode="member"
    />
  );
}
