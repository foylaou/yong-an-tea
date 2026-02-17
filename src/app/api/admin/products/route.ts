import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { productApiSchema } from '@/lib/validations/product';

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
  const categoryId = searchParams.get('categoryId') || '';
  const status = searchParams.get('status') || ''; // 'active' | 'inactive' | ''

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('products')
    .select('*, product_categories(category_id, categories(id, name))', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,sku.eq.${parseInt(search, 10) || 0}`);
  }

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
  }

  const { data: products, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter by category if specified (post-query since it's a join)
  let filtered = products || [];
  if (categoryId) {
    filtered = filtered.filter((p: any) =>
      p.product_categories?.some((pc: any) => pc.category_id === categoryId)
    );
  }

  return NextResponse.json({
    products: filtered,
    total: categoryId ? filtered.length : (count || 0),
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
  const result = productApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const { category_ids, ...productData } = result.data;

  // Insert product
  const { data: product, error: insertError } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Insert product_categories
  if (category_ids.length > 0) {
    const { error: catError } = await supabase
      .from('product_categories')
      .insert(category_ids.map((cid) => ({
        product_id: product.id,
        category_id: cid,
      })));
    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ product }, { status: 201 });
}
