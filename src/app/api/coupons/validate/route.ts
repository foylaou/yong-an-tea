import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateCoupon } from '@/lib/coupons-db';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const body = await request.json();
  const { code, subtotal, product_ids } = body;

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: '請輸入折扣碼' }, { status: 400 });
  }

  if (typeof subtotal !== 'number' || subtotal < 0) {
    return NextResponse.json({ error: '無效的訂單金額' }, { status: 400 });
  }

  const result = await validateCoupon(
    code,
    user.id,
    subtotal,
    Array.isArray(product_ids) ? product_ids : []
  );

  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    discount_type: result.coupon!.discount_type,
    discount_value: result.coupon!.discount_value,
    discount_amount: result.discountAmount,
    description: result.coupon!.description,
  });
}
