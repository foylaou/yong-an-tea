import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      quantity,
      variant_id,
      product:products (
        id,
        title,
        price,
        slug,
        sm_image
      ),
      variant:product_variants (
        id,
        name,
        price,
        discount_price
      )
    `
    )
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? [])
    .filter((row: any) => row.product)
    .map((row: any) => {
      const hasVariant = row.variant != null;
      const effectivePrice = hasVariant
        ? Number(row.variant.discount_price ?? row.variant.price)
        : Number(row.product.price);
      const id = hasVariant
        ? `${row.product.id}_${row.variant.id}`
        : row.product.id;

      return {
        id,
        variantId: row.variant?.id ?? null,
        variantName: row.variant?.name ?? null,
        name: row.product.title,
        price: effectivePrice,
        quantity: row.quantity,
        totalPrice: effectivePrice * row.quantity,
        image: row.product.sm_image ?? '',
        slug: `/products/${row.product.slug}`,
      };
    });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const items: { product_id: string; variant_id?: string | null; quantity: number }[] =
    body.items ?? [];

  // Full replacement: delete all then insert
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (items.length > 0) {
    const rows = items.map((item) => ({
      user_id: user.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
    }));

    const { error: insertError } = await supabase
      .from('cart_items')
      .insert(rows);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
