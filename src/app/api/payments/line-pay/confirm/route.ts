import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { confirmPayment } from '@/lib/line-pay';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('transactionId');
  const orderId = searchParams.get('orderId'); // LINE Pay passes orderId back

  if (!transactionId) {
    return NextResponse.redirect(
      new URL('/checkout?error=missing_transaction', request.url)
    );
  }

  const supabase = createAdminClient();

  // Find the payment record by transactionId
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*, orders(id, order_number, total)')
    .eq('transaction_id', transactionId)
    .single();

  if (paymentError || !payment) {
    return NextResponse.redirect(
      new URL('/checkout?error=payment_not_found', request.url)
    );
  }

  const order = payment.orders as Record<string, unknown>;
  const amount = Number(order.total);

  try {
    // Confirm with LINE Pay
    await confirmPayment(transactionId, amount);

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/order-success/${order.order_number}`, request.url)
    );
  } catch (err: unknown) {
    console.error('LINE Pay confirm failed:', err);

    // Mark payment as failed
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', payment.id);

    await supabase
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('id', order.id);

    return NextResponse.redirect(
      new URL('/checkout?error=payment_failed', request.url)
    );
  }
}
