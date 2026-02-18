import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrderApiSchema } from '@/lib/validations/order';
import {
  getShippingSettings,
  calculateShippingFee,
  validateCartItems,
  createOrder,
} from '@/lib/orders-db';
import { validateCoupon, recordCouponUsage } from '@/lib/coupons-db';
import { reservePayment } from '@/lib/line-pay';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { orderConfirmationEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const body = await request.json();
  const result = createOrderApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;

  // Validate cart items (check stock, prices, active status)
  const validation = await validateCartItems(data.items);
  if (!validation.valid) {
    return NextResponse.json(
      { error: '購物車驗證失敗', details: validation.errors },
      { status: 400 }
    );
  }

  // Calculate shipping
  const shippingSettings = await getShippingSettings();
  let shippingFee = calculateShippingFee(
    validation.subtotal,
    shippingSettings.shipping_fee,
    shippingSettings.free_shipping_threshold
  );

  // Validate coupon if provided
  let couponResult: Awaited<ReturnType<typeof validateCoupon>> | null = null;
  let discountAmount = 0;

  if (data.coupon_code) {
    const cartProductIds = data.items.map((i) => i.product_id);
    couponResult = await validateCoupon(
      data.coupon_code,
      user.id,
      validation.subtotal,
      cartProductIds
    );

    if (!couponResult.valid) {
      return NextResponse.json(
        { error: couponResult.error || '折扣碼無效' },
        { status: 400 }
      );
    }

    discountAmount = couponResult.discountAmount;

    // free_shipping type: override shipping fee to 0
    if (couponResult.coupon?.discount_type === 'free_shipping') {
      shippingFee = 0;
    }
  }

  // Create order atomically
  let orderResult;
  try {
    orderResult = await createOrder({
      customer_id: user.id,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      shipping_address: data.shipping_address,
      payment_method: data.payment_method,
      shipping_method: 'tcat',
      shipping_fee: shippingFee,
      note: data.note || '',
      items: data.items,
      coupon_code: data.coupon_code,
      discount_amount: discountAmount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '建立訂單失敗';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Record coupon usage after order created
  if (couponResult?.valid && couponResult.coupon) {
    await recordCouponUsage(
      couponResult.coupon.id,
      user.id,
      orderResult.order_id
    );
  }

  // Save address if requested
  if (data.save_address) {
    const adminClient = createAdminClient();
    await adminClient.from('addresses').insert({
      user_id: user.id,
      label: '住家',
      recipient_name: data.customer_name,
      phone: data.customer_phone,
      postal_code: data.shipping_address.postal_code || '',
      city: data.shipping_address.city,
      district: data.shipping_address.district,
      address_line1: data.shipping_address.address_line1,
      address_line2: data.shipping_address.address_line2 || '',
      is_default: false,
    });
  }

  // Send order confirmation email (non-blocking)
  try {
    const emailHtml = orderConfirmationEmail(
      {
        order_number: orderResult.order_number,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        shipping_address: data.shipping_address as Record<string, string>,
        subtotal: orderResult.subtotal,
        shipping_fee: orderResult.shipping_fee,
        discount_amount: orderResult.discount_amount,
        total: orderResult.total,
      },
      validation.items
    );
    sendEmail({
      to: data.customer_email,
      subject: `訂單確認 — ${orderResult.order_number}`,
      html: emailHtml,
    }).catch((err) => console.error('Order confirmation email failed:', err));
  } catch (err) {
    console.error('Order confirmation email error:', err);
  }

  // If LINE Pay, reserve payment and return paymentUrl
  if (data.payment_method === 'line_pay') {
    try {
      const linePayResult = await reservePayment(
        orderResult.order_id,
        orderResult.order_number,
        orderResult.total,
        validation.items.map((item) => ({
          name: item.product_title,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      // Create payment record
      const adminClient = createAdminClient();
      await adminClient.from('payments').insert({
        order_id: orderResult.order_id,
        method: 'line_pay',
        status: 'pending',
        amount: orderResult.total,
        transaction_id: linePayResult.transactionId,
      });

      return NextResponse.json({
        order: orderResult,
        paymentUrl: linePayResult.paymentUrl,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'LINE Pay 付款失敗';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // For bank_transfer or cod, create payment record
  const adminClient = createAdminClient();
  await adminClient.from('payments').insert({
    order_id: orderResult.order_id,
    method: data.payment_method,
    status: 'pending',
    amount: orderResult.total,
  });

  return NextResponse.json({ order: orderResult });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '10', 10);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data: orders, count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: orders || [],
    total: count || 0,
    page,
    perPage,
  });
}
