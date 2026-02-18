import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const branchUpdateSchema = z.object({
  name: z.string().min(1, '分店名稱為必填').optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  business_hours: z.string().optional(),
  map_embed_url: z.string().optional(),
  image_url: z.string().optional(),
  is_primary: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { data: branch, error } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: '找不到分店' }, { status: 404 });
  }

  return NextResponse.json({ branch });
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
  const result = branchUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // If setting as primary, unset others first
  if (result.data.is_primary) {
    await supabase
      .from('branches')
      .update({ is_primary: false })
      .neq('id', id);
  }

  const { data: branch, error } = await supabase
    .from('branches')
    .update(result.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ branch });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  // Prevent deleting the primary branch
  const { data: branch } = await supabase
    .from('branches')
    .select('is_primary')
    .eq('id', id)
    .single();

  if (branch?.is_primary) {
    return NextResponse.json(
      { error: '無法刪除主要分店，請先將其他分店設為主要' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
