import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { customerApiSchema } from '@/lib/validations/customer';

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

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '20', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  if (category === 'regular' || category === 'wholesale') {
    query = query.eq('category', category);
  }

  const { data: customers, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    customers: customers || [],
    total: count || 0,
    page,
    perPage,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();

  // Every field but `name` is optional, so this same schema covers both
  // the full customer form and the POS quick-add (name + phone only).
  const result = customerApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const { data: customer, error: insertError } = await supabase
    .from('customers')
    .insert(result.data)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ customer }, { status: 201 });
}
