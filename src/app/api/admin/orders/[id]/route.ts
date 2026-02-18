import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateOrderStatusSchema } from '@/lib/validations/order';
import { sendEmail } from '@/lib/email';
import { shippingNotificationEmail } from '@/lib/email-templates';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = updateOrderStatusSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Get current order
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError || !currentOrder) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  // Validate status transition
  const allowedTransitions = STATUS_TRANSITIONS[currentOrder.status] || [];
  if (!allowedTransitions.includes(result.data.status)) {
    return NextResponse.json(
      {
        error: `無法從「${currentOrder.status}」轉換為「${result.data.status}」`,
      },
      { status: 400 }
    );
  }

  // Build update data with timestamp handling
  const updateData: Record<string, unknown> = {
    status: result.data.status,
  };

  if (result.data.tracking_number) {
    updateData.tracking_number = result.data.tracking_number;
  }

  // Set relevant timestamps
  switch (result.data.status) {
    case 'paid':
      updateData.payment_status = 'paid';
      updateData.paid_at = new Date().toISOString();
      break;
    case 'shipped':
      updateData.shipped_at = new Date().toISOString();
      break;
    case 'completed':
      updateData.completed_at = new Date().toISOString();
      break;
    case 'refunded':
      updateData.payment_status = 'refunded';
      break;
  }

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send shipping notification email (non-blocking)
  if (result.data.status === 'shipped' && order.customer_email) {
    try {
      const emailHtml = shippingNotificationEmail(
        {
          order_number: order.order_number,
          customer_name: order.customer_name,
        },
        order.tracking_number || undefined
      );
      sendEmail({
        to: order.customer_email,
        subject: `出貨通知 — ${order.order_number}`,
        html: emailHtml,
      }).catch((err) => console.error('Shipping notification email failed:', err));
    } catch (err) {
      console.error('Shipping notification email error:', err);
    }
  }

  return NextResponse.json({ order });
}
