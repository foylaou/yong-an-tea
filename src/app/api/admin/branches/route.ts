import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const branchSchema = z.object({
  name: z.string().min(1, '分店名稱為必填'),
  phone: z.string().optional().default(''),
  email: z.string().optional().default(''),
  address: z.string().optional().default(''),
  business_hours: z.string().optional().default(''),
  map_embed_url: z.string().optional().default(''),
  image_url: z.string().optional().default(''),
  is_primary: z.boolean().optional().default(false),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
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

export async function GET() {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { data: branches, error } = await supabase
    .from('branches')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ branches: branches || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = branchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // If setting as primary, unset others
  if (result.data.is_primary) {
    await supabase
      .from('branches')
      .update({ is_primary: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }

  const { data: branch, error } = await supabase
    .from('branches')
    .insert(result.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ branch }, { status: 201 });
}
