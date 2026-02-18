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
      product:products (
        id,
        title,
        price,
        slug,
        sm_image
      )
    `
    )
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? [])
    .filter((row: any) => row.product)
    .map((row: any) => ({
      id: row.product.id,
      name: row.product.title,
      price: Number(row.product.price),
      quantity: row.quantity,
      totalPrice: Number(row.product.price) * row.quantity,
      image: row.product.sm_image ?? '',
      slug: row.product.slug,
    }));

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
  const items: { product_id: string; quantity: number }[] = body.items ?? [];

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
