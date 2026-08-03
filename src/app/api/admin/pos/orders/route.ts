import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { posOrderApiSchema } from '@/lib/validations/pos';
import { createOrder } from '@/lib/orders-db';

async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return user;
}

/**
 * Manual in-store order entry (銷售模式). Unlike the storefront's
 * POST /api/orders, this never requires the customer to be logged in —
 * it links to a `customers` row (walk_in_customer_id) instead of an
 * auth-backed profile, and skips shipping/coupon logic since it's an
 * immediate in-person sale.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = posOrderApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '驗證失敗', details: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;

  let orderResult;
  try {
    orderResult = await createOrder({
      walk_in_customer_id: data.walk_in_customer_id ?? undefined,
      channel: data.channel,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      payment_method: data.payment_method,
      shipping_method: 'pickup',
      shipping_fee: 0,
      cod_fee: 0,
      note: '',
      items: data.items,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '建立訂單失敗';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // In-store sales are handed over immediately — mark fulfilled right away,
  // and reflect whether payment was actually collected.
  const adminClient = createAdminClient();
  const now = new Date().toISOString();
  const paymentStatus = data.is_paid ? 'paid' : 'pending';

  await adminClient
    .from('orders')
    .update({
      status: 'completed',
      payment_status: paymentStatus,
      completed_at: now,
      ...(data.is_paid && { paid_at: now }),
    })
    .eq('id', orderResult.order_id);

  await adminClient.from('payments').insert({
    order_id: orderResult.order_id,
    method: data.payment_method,
    status: paymentStatus,
    amount: orderResult.total,
    ...(data.is_paid && { paid_at: now }),
  });

  return NextResponse.json({ order: orderResult });
}
