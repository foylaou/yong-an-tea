import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const adminClient = createAdminClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  // Fetch auth users via admin API
  const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Fetch all profiles
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, full_name, role');

  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  );

  // Merge auth users with profiles
  let merged = (users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    full_name: profileMap.get(u.id)?.full_name || '',
    role: profileMap.get(u.id)?.role || 'customer',
    created_at: u.created_at,
  }));

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    merged = merged.filter(
      (u: any) =>
        u.email?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q)
    );
  }

  // Filter by role
  if (role) {
    merged = merged.filter((u: any) => u.role === role);
  }

  // Sort by created_at desc
  merged.sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({ users: merged, total: merged.length });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, full_name, role } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email 和密碼為必填' }, { status: 400 });
  }

  if (role && !['admin', 'customer'].includes(role)) {
    return NextResponse.json({ error: '角色無效' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Create auth user
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Update profile (trigger should have created it)
  if (full_name || role) {
    await adminClient
      .from('profiles')
      .update({
        ...(full_name && { full_name }),
        ...(role && { role }),
      })
      .eq('id', newUser.user.id);
  }

  return NextResponse.json({
    user: {
      id: newUser.user.id,
      email: newUser.user.email,
      full_name: full_name || '',
      role: role || 'customer',
      created_at: newUser.user.created_at,
    },
  }, { status: 201 });
}
