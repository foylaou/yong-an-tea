import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  reserveAdd,
  reserveEdit,
  reserveDelete,
  reserveQuery,
  clearTcatCache,
  Spec,
  DeliveryTime,
} from '@/lib/tcat';

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

function stripPhone(phone: string): string {
  return (phone || '').replace(/[-\s()+]/g, '');
}

/**
 * POST — 新增逆物流預約 (退貨取件)
 * Body: { takeDate: string (yyyyMMdd), deliveryTime?: string, memo?: string }
 *
 * 寄件人 = 客戶 (原收件人)
 * 收件人 = 店家 (原寄件人，從 site_settings 讀取)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const adminDb = createAdminClient();
  const { data: order, error: orderError } = await adminDb
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  if (order.reverse_obt_number) {
    return NextResponse.json(
      { error: '此訂單已有逆物流單號，請先刪除再重新建立' },
      { status: 400 },
    );
  }

  // Get shop/sender settings (will become the "recipient" in reverse)
  const { data: settingsRows } = await adminDb
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'tcat_sender_name',
      'tcat_sender_phone',
      'tcat_sender_mobile',
      'tcat_sender_address',
    ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRows || []) {
    settings[row.key] = String(row.value || '');
  }

  const shopName = settings.tcat_sender_name;
  const shopPhone = stripPhone(settings.tcat_sender_phone);
  const shopMobile = stripPhone(settings.tcat_sender_mobile);
  const shopAddress = settings.tcat_sender_address;

  if (!shopName || !shopMobile || !shopAddress) {
    return NextResponse.json(
      { error: '店家寄件人資訊未完整設定，請至後台系統設定 → 物流設定填寫' },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const takeDate = body.takeDate;
  if (!takeDate || !/^\d{8}$/.test(takeDate)) {
    return NextResponse.json(
      { error: '請提供有效的取件日期 (yyyyMMdd 格式)' },
      { status: 400 },
    );
  }

  // Validate takeDate is D+1 ~ D+7
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const takeDateObj = new Date(
    parseInt(takeDate.slice(0, 4)),
    parseInt(takeDate.slice(4, 6)) - 1,
    parseInt(takeDate.slice(6, 8)),
  );
  const diffDays = Math.round((takeDateObj.getTime() - today.getTime()) / (86400000));
  if (diffDays < 1 || diffDays > 7) {
    return NextResponse.json(
      { error: '取件日期必須為明天到 7 天內' },
      { status: 400 },
    );
  }

  // Build addresses
  const addr = order.shipping_address || {};
  const customerAddress = `${addr.city || ''}${addr.district || ''}${addr.address_line1 || ''}${addr.address_line2 || ''}`;

  // Determine thermosphere from order items
  let thermo = '0001';
  const productIds = (order.order_items || []).map((i: any) => i.product_id).filter(Boolean);
  if (productIds.length > 0) {
    const { data: products } = await adminDb
      .from('products')
      .select('thermosphere')
      .in('id', productIds);
    for (const p of products || []) {
      if (p.thermosphere === '0003') { thermo = '0003'; break; }
      if (p.thermosphere === '0002' && thermo !== '0003') thermo = '0002';
    }
  }

  const items = order.order_items || [];
  const productName = items.length === 1
    ? items[0].product_title
    : `${items[0]?.product_title || '商品'} 等${items.length}項（退貨）`;

  clearTcatCache();

  try {
    const result = await reserveAdd({
      order: {
        orderId: `R-${order.order_number}`,
        thermosphere: thermo,
        spec: Spec.S60,
        // 逆物流：寄件人 = 客戶，收件人 = 店家
        senderName: order.customer_name,
        senderTel: stripPhone(order.customer_phone),
        senderMobile: stripPhone(order.customer_phone),
        senderAddress: customerAddress,
        recipientName: shopName,
        recipientTel: shopPhone || shopMobile,
        recipientMobile: shopMobile,
        recipientAddress: shopAddress,
        takeDate,
        deliveryTime: body.deliveryTime || DeliveryTime.Anytime,
        productName,
        memo: body.memo || `退貨 - 訂單 ${order.order_number}`,
      },
    });

    if (result.IsOK !== 'Y' || !result.Data) {
      return NextResponse.json(
        { error: result.Message || '逆物流 API 回傳錯誤' },
        { status: 500 },
      );
    }

    const obtNumber = result.Data.Order.OBTNumber;

    // Save reverse OBT number to order
    await adminDb
      .from('orders')
      .update({ reverse_obt_number: obtNumber })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      obtNumber,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '呼叫逆物流 API 失敗' },
      { status: 500 },
    );
  }
}

/**
 * GET — 查詢逆物流預約狀態
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const adminDb = createAdminClient();
  const { data: order } = await adminDb
    .from('orders')
    .select('reverse_obt_number')
    .eq('id', id)
    .single();

  if (!order?.reverse_obt_number) {
    return NextResponse.json({ error: '此訂單無逆物流單號' }, { status: 404 });
  }

  clearTcatCache();

  try {
    const result = await reserveQuery(order.reverse_obt_number);
    if (result.IsOK !== 'Y' || !result.Data) {
      return NextResponse.json(
        { error: result.Message || '查詢失敗' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      order: result.Data.Order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '查詢逆物流失敗' },
      { status: 500 },
    );
  }
}

/**
 * DELETE — 刪除逆物流預約
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const adminDb = createAdminClient();
  const { data: order } = await adminDb
    .from('orders')
    .select('reverse_obt_number')
    .eq('id', id)
    .single();

  if (!order?.reverse_obt_number) {
    return NextResponse.json({ error: '此訂單無逆物流單號' }, { status: 404 });
  }

  clearTcatCache();

  try {
    const result = await reserveDelete(order.reverse_obt_number);
    if (result.IsOK !== 'Y') {
      return NextResponse.json(
        { error: result.Message || '刪除失敗' },
        { status: 500 },
      );
    }

    // Clear reverse OBT number from order
    await adminDb
      .from('orders')
      .update({ reverse_obt_number: null })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '刪除逆物流失敗' },
      { status: 500 },
    );
  }
}
