import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { reservePayment } from '@/lib/line-pay';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const { order_id } = await request.json();
  if (!order_id) {
    return NextResponse.json({ error: '缺少 order_id' }, { status: 400 });
  }

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', order_id)
    .eq('customer_id', user.id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  if (order.payment_status !== 'pending') {
    return NextResponse.json({ error: '訂單已付款或已取消' }, { status: 400 });
  }

  try {
    const linePayResult = await reservePayment(
      order.id,
      order.order_number,
      Number(order.total),
      (order.order_items || []).map((item: Record<string, unknown>) => ({
        name: item.product_title as string,
        quantity: item.quantity as number,
        price: Number(item.price),
      }))
    );

    // Create/update payment record
    const adminClient = createAdminClient();
    await adminClient.from('payments').upsert(
      {
        order_id: order.id,
        method: 'line_pay',
        status: 'pending',
        amount: Number(order.total),
        transaction_id: linePayResult.transactionId,
      },
      { onConflict: 'order_id' }
    );

    return NextResponse.json({ paymentUrl: linePayResult.paymentUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'LINE Pay 預約付款失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
