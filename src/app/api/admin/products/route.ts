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

  const sortBy = searchParams.get('sortBy') || 'custom'; // 'newest' | 'oldest' | 'sales' | 'custom'

  let query = supabase
    .from('products')
    .select('*, product_categories(category_id, categories(id, name))', { count: 'exact' })
    .range(from, to);

  // Apply sorting
  if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else {
    // 'custom' or 'sales' — default to sort_order, then created_at
    query = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
  }

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
  const variants = body.variants as any[] | undefined;
  const galleryImages = body.gallery_images as any[] | undefined;

  // Auto-populate product image columns from first gallery image
  if (galleryImages && galleryImages.length > 0) {
    const first = galleryImages[0];
    productData.sm_image = first.sm_url;
    productData.md_image = first.md_url;
    productData.xs_image = first.sm_url;
    if (!productData.home_collection_img) productData.home_collection_img = first.md_url;
    if (!productData.category_banner_img) productData.category_banner_img = first.md_url;
  }

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

  // Insert variants
  if (variants && variants.length > 0) {
    const { error: varError } = await supabase
      .from('product_variants')
      .insert(variants.map((v: any, idx: number) => ({
        product_id: product.id,
        name: v.name,
        price: v.price,
        discount_price: v.discount_price || null,
        stock_qty: v.stock_qty ?? 0,
        sku: v.sku || null,
        sort_order: idx,
        is_active: v.is_active ?? true,
        image_index: v.image_index ?? null,
      })));
    if (varError) {
      return NextResponse.json({ error: varError.message }, { status: 500 });
    }
  }

  // Insert gallery images
  if (galleryImages && galleryImages.length > 0) {
    await supabase
      .from('product_images')
      .insert(galleryImages.map((img: any, idx: number) => ({
        product_id: product.id,
        sort_order: idx,
        sm_url: img.sm_url,
        md_url: img.md_url,
        alt_text: img.alt_text || '',
      })));
  }

  return NextResponse.json({ product }, { status: 201 });
}

// PATCH: batch update sort_order for products
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

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
  const items = body.items as { id: string; sort_order: number }[];

  if (!items?.length) {
    return NextResponse.json({ error: '缺少排序資料' }, { status: 400 });
  }

  // Batch update sort_order
  const results = await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase
        .from('products')
        .update({ sort_order })
        .eq('id', id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
