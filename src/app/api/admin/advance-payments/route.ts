import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { advancePaymentApiSchema } from '@/lib/validations/finance';

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
  const status = searchParams.get('status') || '';

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('advance_payments')
    .select('*', { count: 'exact' })
    .order('advance_date', { ascending: false })
    .range(from, to);

  if (status === 'outstanding' || status === 'returned') {
    query = query.eq('status', status);
  }

  const { data: advances, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: outstandingRows } = await supabase
    .from('advance_payments')
    .select('amount')
    .eq('status', 'outstanding');
  const outstandingTotal = (outstandingRows || []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0);

  return NextResponse.json({
    advances: advances || [],
    total: count || 0,
    page,
    perPage,
    outstandingTotal,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = advancePaymentApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const { data: advance, error: insertError } = await supabase
    .from('advance_payments')
    .insert(result.data)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ advance }, { status: 201 });
}
