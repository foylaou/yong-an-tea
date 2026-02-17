import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { categoryApiSchema } from '@/lib/validations/category';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '20', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || ''; // 'active' | 'inactive' | ''

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('categories')
    .select('*, parent:categories!parent_id(id, name)', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
  }

  const { data: categories, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get product counts for each category
  const categoryIds = (categories || []).map((c: any) => c.id);
  let productCounts: Record<string, number> = {};

  if (categoryIds.length > 0) {
    const { data: pcData } = await supabase
      .from('product_categories')
      .select('category_id')
      .in('category_id', categoryIds);

    if (pcData) {
      for (const pc of pcData) {
        productCounts[pc.category_id] = (productCounts[pc.category_id] || 0) + 1;
      }
    }
  }

  const categoriesWithCount = (categories || []).map((cat: any) => ({
    ...cat,
    product_count: productCounts[cat.id] || 0,
  }));

  return NextResponse.json({
    categories: categoriesWithCount,
    total: count || 0,
    page,
    perPage,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = categoryApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const { data: category, error: insertError } = await supabase
    .from('categories')
    .insert(result.data)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ category }, { status: 201 });
}
