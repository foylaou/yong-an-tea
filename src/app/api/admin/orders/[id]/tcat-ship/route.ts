import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  printOBT,
  printOBTByB2S,
  parseAddress,
  extractZipCode,
  clearTcatCache,
  getDeliverySettings,
  getNextDeliveryDate,
  PrintOBTType,
  PrintOBTB2SType,
  Thermosphere,
  Spec,
  DeliveryTime,
  ProductTypeId,
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

  // Get order details
  const adminDb = createAdminClient();
  const { data: order, error: orderError } = await adminDb
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  if (order.tracking_number) {
    return NextResponse.json(
      { error: '此訂單已有託運單號，無需重複產生' },
      { status: 400 },
    );
  }

  // Get sender settings
  const { data: settingsRows } = await adminDb
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'tcat_sender_name',
      'tcat_sender_phone',
      'tcat_sender_mobile',
      'tcat_sender_zipcode',
      'tcat_sender_address',
    ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRows || []) {
    settings[row.key] = String(row.value || '');
  }

  const senderName = settings.tcat_sender_name;
  const senderPhone = stripPhone(settings.tcat_sender_phone);
  const senderMobile = stripPhone(settings.tcat_sender_mobile);
  const senderZipCode = settings.tcat_sender_zipcode;
  const senderAddress = settings.tcat_sender_address;

  // Clear credential cache to ensure latest padded ID is used
  clearTcatCache();

  if (!senderName || !senderMobile || !senderAddress || !senderZipCode) {
    return NextResponse.json(
      { error: '寄件人資訊未完整設定（姓名、手機、郵遞區號、地址），請至後台系統設定 → 物流設定填寫' },
      { status: 400 },
    );
  }

  // Parse request body for optional overrides
  const body = await request.json().catch(() => ({}));

  const address = order.shipping_address || {};
  const recipientAddress = `${address.city || ''}${address.district || ''}${address.address_line1 || ''}${address.address_line2 || ''}`;

  // Query T-Cat 6-digit zip codes for sender address
  let senderZip6 = '';
  try {
    const parseResult = await parseAddress({ addresses: [senderAddress] });
    if (parseResult.IsOK === 'Y' && parseResult.Data?.Addresses?.[0]) {
      senderZip6 = extractZipCode(parseResult.Data.Addresses[0].PostNumber);
    }
  } catch {
    // ignore, will fail at printOBT validation
  }

  if (!senderZip6) {
    return NextResponse.json(
      { error: '無法解析寄件人地址的黑貓郵號，請確認寄件人地址是否正確' },
      { status: 400 },
    );
  }

  // Build product name and determine thermosphere from order items
  const items = order.order_items || [];
  const productName =
    items.length === 1
      ? items[0].product_title
      : `${items[0]?.product_title || '商品'} 等${items.length}項`;

  // Auto-detect thermosphere: use the coldest requirement among all items
  // 0003(冷凍) > 0002(冷藏) > 0001(常溫)
  let orderThermosphere = '0001';
  const productIds = items.map((i: any) => i.product_id).filter(Boolean);
  if (productIds.length > 0) {
    const { data: products } = await adminDb
      .from('products')
      .select('thermosphere')
      .in('id', productIds);
    for (const p of products || []) {
      if (p.thermosphere === '0003') { orderThermosphere = '0003'; break; }
      if (p.thermosphere === '0002' && orderThermosphere !== '0003') orderThermosphere = '0002';
    }
  }

  // Calculate dates (skip non-delivery days)
  const today = new Date();
  const shipmentDate = formatDate(today);
  const deliveryOptions = await getDeliverySettings();
  const deliveryDateObj = await getNextDeliveryDate(today, deliveryOptions);
  const deliveryDate = formatDate(deliveryDateObj);

  const isB2S = order.shipping_method === 'tcat_b2s' && order.store_id;

  try {
    let obtNumber: string | undefined;
    let fileNo: string | undefined;
    let printDateTime: string | undefined;

    if (isB2S) {
      // --- B2S (7-11 超商取貨) ---
      const b2sResult = await printOBTByB2S({
        printOBTType: body.printOBTType || PrintOBTB2SType.A4Three,
        orders: [
          {
            orderId: order.order_number,
            thermosphere: body.thermosphere || orderThermosphere,
            spec: body.spec || Spec.S60,
            receiveStoreId: order.store_id,
            recipientName: order.customer_name,
            recipientTel: stripPhone(order.customer_phone),
            recipientMobile: stripPhone(order.customer_phone),
            senderName,
            senderTel: senderPhone || senderMobile,
            senderMobile,
            senderZipCode: senderZip6,
            senderAddress,
            isCollection: order.payment_method === 'cod' ? 'Y' : 'N',
            collectionAmount: order.payment_method === 'cod' ? Number(order.total) : 0,
            memo: order.note || '',
          },
        ],
      });

      if (b2sResult.IsOK !== 'Y' || !b2sResult.Data) {
        return NextResponse.json(
          { error: b2sResult.Message || '黑貓 B2S API 回傳錯誤' },
          { status: 500 },
        );
      }

      obtNumber = b2sResult.Data.Orders[0]?.OBTNumber;
      fileNo = b2sResult.Data.FileNo;
      printDateTime = b2sResult.Data.PrintDateTime;
    } else {
      // --- Normal 宅配 ---
      const result = await printOBT({
        printOBTType: body.printOBTType || PrintOBTType.A4Three,
        orders: [
          {
            orderId: order.order_number,
            thermosphere: body.thermosphere || orderThermosphere,
            spec: body.spec || Spec.S60,
            recipientName: order.customer_name,
            recipientTel: stripPhone(order.customer_phone),
            recipientMobile: stripPhone(order.customer_phone),
            recipientAddress,
            senderName,
            senderTel: senderPhone || senderMobile,
            senderMobile,
            senderZipCode: senderZip6,
            senderAddress,
            shipmentDate,
            deliveryDate,
            deliveryTime: body.deliveryTime || DeliveryTime.Anytime,
            isCollection: order.payment_method === 'cod' ? 'Y' : 'N',
            collectionAmount: order.payment_method === 'cod' ? Number(order.total) : 0,
            productTypeId: body.productTypeId || ProductTypeId.GeneralFood,
            productName,
            memo: order.note || '',
          },
        ],
      });

      if (result.IsOK !== 'Y' || !result.Data) {
        return NextResponse.json(
          { error: result.Message || '黑貓 API 回傳錯誤' },
          { status: 500 },
        );
      }

      obtNumber = result.Data.Orders[0]?.OBTNumber;
      fileNo = result.Data.FileNo;
      printDateTime = result.Data.PrintDateTime;
    }

    // Update order with tracking number
    if (obtNumber) {
      await adminDb
        .from('orders')
        .update({ tracking_number: obtNumber })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      obtNumber,
      fileNo,
      printDateTime,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '呼叫黑貓 API 失敗' },
      { status: 500 },
    );
  }
}

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

  // Only allow clearing if order hasn't shipped yet
  const { data: order, error } = await adminDb
    .from('orders')
    .select('status')
    .eq('id', id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  if (order.status === 'shipped' || order.status === 'completed') {
    return NextResponse.json(
      { error: '已出貨的訂單無法清除託運單號' },
      { status: 400 },
    );
  }

  const { error: updateError } = await adminDb
    .from('orders')
    .update({ tracking_number: null })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** Strip dashes, spaces, parentheses etc. from phone numbers */
function stripPhone(phone: string): string {
  return (phone || '').replace(/[-\s()+]/g, '');
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
