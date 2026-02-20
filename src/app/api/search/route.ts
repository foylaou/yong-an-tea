import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q) {
    return NextResponse.json({ products: [] });
  }

  const supabase = createAdminClient();
  const pattern = `%${q}%`;

  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug, price, discount_price, xs_image, sm_image, availability, stock_qty')
    .eq('is_active', true)
    .or(`title.ilike.${pattern},desc_text.ilike.${pattern},tag.ilike.${pattern}`)
    .order('sort_order', { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ products: [], error: error.message }, { status: 500 });
  }

  const products = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    discountPrice: row.discount_price ? Number(row.discount_price) : null,
    image: row.sm_image?.startsWith('http')
      ? row.sm_image
      : row.xs_image?.startsWith('http')
        ? row.xs_image
        : '',
    availability: row.availability,
    stockQty: row.stock_qty ?? 0,
  }));

  return NextResponse.json({ products });
}
