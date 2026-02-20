import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('customer_id', user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

// Customer cancels their own order
const cancelSchema = z.object({
  cancel_reason: z.string().min(1, '請填寫取消原因').max(500),
});

// Statuses that customers are allowed to cancel
const CUSTOMER_CANCELLABLE: string[] = ['pending', 'paid'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const body = await request.json();
  const result = cancelSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Fetch order and verify ownership
  const adminClient = createAdminClient();
  const { data: order, error: fetchError } = await adminClient
    .from('orders')
    .select('id, status, customer_id')
    .eq('id', id)
    .eq('customer_id', user.id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
    return NextResponse.json(
      { error: '目前訂單狀態無法取消，如需協助請聯繫客服' },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await adminClient
    .from('orders')
    .update({
      status: 'cancelled',
      cancel_reason: result.data.cancel_reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ order: updated });
}
