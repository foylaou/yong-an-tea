import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getReviewsByProduct } from '@/lib/reviews-db';
import { reviewFormSchema } from '@/lib/validations/review';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const result = await getReviewsByProduct(productId, page, 5);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { rating, title, content } = parsed.data;
  const productId = body.product_id;

  if (!productId) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
  }

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from('product_reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('customer_id', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: '您已經評價過此商品' }, { status: 409 });
  }

  // Check if user has purchased this product
  const { data: hasPurchased } = await supabase.rpc('has_purchased_product', {
    p_product_id: productId,
  });

  const { data: review, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      customer_id: user.id,
      rating,
      title: title || null,
      content,
      is_verified_purchase: !!hasPurchased,
    })
    .select()
    .single();

  if (error) {
    console.error('Create review error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}
