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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, role, password } = body;

  if (role && !['admin', 'customer'].includes(role)) {
    return NextResponse.json({ error: '角色無效' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Update profile
  const profileUpdate: any = {};
  if (full_name !== undefined) profileUpdate.full_name = full_name;
  if (role !== undefined) profileUpdate.role = role;

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profileError } = await adminClient
      .from('profiles')
      .update(profileUpdate)
      .eq('id', id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  // Update password if provided
  if (password) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(id, {
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  // Prevent self-deletion
  if (admin.id === id) {
    return NextResponse.json({ error: '不能刪除自己的帳號' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
