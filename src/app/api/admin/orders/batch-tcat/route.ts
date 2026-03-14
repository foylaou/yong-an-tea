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
  downloadOBT,
  PrintOBTType,
  PrintOBTB2SType,
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

function stripPhone(phone: string): string {
  return (phone || '').replace(/[-\s()+]/g, '');
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * POST — 批量產生託運單 (自動分流宅配 / B2S)
 * Body: { orderIds: string[] }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { orderIds } = await request.json();
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ error: '請選擇訂單' }, { status: 400 });
  }

  const adminDb = createAdminClient();

  // Fetch all orders
  const { data: orders, error: ordersError } = await adminDb
    .from('orders')
    .select('*, order_items(*)')
    .in('id', orderIds);

  if (ordersError || !orders?.length) {
    return NextResponse.json({ error: '查無訂單' }, { status: 404 });
  }

  // Filter eligible orders (no tracking number, status = processing or paid)
  const eligible = orders.filter(
    (o) => !o.tracking_number && ['processing', 'paid'].includes(o.status),
  );
  if (eligible.length === 0) {
    return NextResponse.json(
      { error: '所選訂單中沒有可產生託運單的訂單（需為處理中/已付款且無託運單號）' },
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
      'tcat_sender_address',
    ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRows || []) {
    settings[row.key] = String(row.value || '');
  }

  const senderName = settings.tcat_sender_name;
  const senderPhone = stripPhone(settings.tcat_sender_phone);
  const senderMobile = stripPhone(settings.tcat_sender_mobile);
  const senderAddress = settings.tcat_sender_address;

  if (!senderName || !senderMobile || !senderAddress) {
    return NextResponse.json(
      { error: '寄件人資訊未完整設定，請至後台系統設定 → 物流設定填寫' },
      { status: 400 },
    );
  }

  clearTcatCache();

  // Get sender zip code via ParsingAddress
  let senderZip6 = '';
  try {
    const parseResult = await parseAddress({ addresses: [senderAddress] });
    if (parseResult.IsOK === 'Y' && parseResult.Data?.Addresses?.[0]) {
      senderZip6 = extractZipCode(parseResult.Data.Addresses[0].PostNumber);
    }
  } catch { /* ignore */ }

  if (!senderZip6) {
    return NextResponse.json(
      { error: '無法解析寄件人地址的黑貓郵號' },
      { status: 400 },
    );
  }

  // Calculate delivery date (for 宅配 orders)
  const today = new Date();
  const shipmentDate = formatDate(today);
  const deliveryOptions = await getDeliverySettings();
  const deliveryDateObj = await getNextDeliveryDate(today, deliveryOptions);
  const deliveryDate = formatDate(deliveryDateObj);

  // Collect all product IDs to fetch thermosphere data
  const allProductIds = new Set<string>();
  for (const order of eligible) {
    for (const item of order.order_items || []) {
      if (item.product_id) allProductIds.add(item.product_id);
    }
  }
  const productThermosphereMap: Record<string, string> = {};
  if (allProductIds.size > 0) {
    const { data: products } = await adminDb
      .from('products')
      .select('id, thermosphere')
      .in('id', [...allProductIds]);
    for (const p of products || []) {
      productThermosphereMap[p.id] = p.thermosphere || '0001';
    }
  }

  // Helper: get coldest thermosphere for an order
  function getOrderThermosphere(order: any): string {
    let thermo = '0001';
    for (const item of order.order_items || []) {
      const t = productThermosphereMap[item.product_id] || '0001';
      if (t === '0003') { thermo = '0003'; break; }
      if (t === '0002' && thermo !== '0003') thermo = '0002';
    }
    return thermo;
  }

  // Helper: build product name
  function getProductName(order: any): string {
    const items = order.order_items || [];
    return items.length === 1
      ? items[0].product_title
      : `${items[0]?.product_title || '商品'} 等${items.length}項`;
  }

  // Split orders into 宅配 and B2S groups
  const tcatOrders = eligible.filter(
    (o) => !(o.shipping_method === 'tcat_b2s' && o.store_id),
  );
  const b2sOrders = eligible.filter(
    (o) => o.shipping_method === 'tcat_b2s' && o.store_id,
  );

  const allResults: { orderNumber: string; obtNumber: string }[] = [];
  const fileNos: string[] = [];
  const errors: string[] = [];

  // --- 宅配 batch (single printOBT call) ---
  if (tcatOrders.length > 0) {
    const printOrders = tcatOrders.map((order) => {
      const addr = order.shipping_address || {};
      const recipientAddress = `${addr.city || ''}${addr.district || ''}${addr.address_line1 || ''}${addr.address_line2 || ''}`;
      return {
        orderId: order.order_number,
        thermosphere: getOrderThermosphere(order),
        spec: Spec.S60,
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
        deliveryTime: DeliveryTime.Anytime,
        isCollection: order.payment_method === 'cod' ? 'Y' as const : 'N' as const,
        collectionAmount: order.payment_method === 'cod' ? Number(order.total) : 0,
        productTypeId: ProductTypeId.GeneralFood,
        productName: getProductName(order),
        memo: order.note || '',
      };
    });

    try {
      const result = await printOBT({
        printOBTType: PrintOBTType.A4Three,
        orders: printOrders,
      });

      if (result.IsOK === 'Y' && result.Data) {
        fileNos.push(result.Data.FileNo);
        for (const ret of result.Data.Orders || []) {
          const matched = tcatOrders.find((o) => o.order_number === ret.OrderId);
          if (matched && ret.OBTNumber) {
            await adminDb
              .from('orders')
              .update({ tracking_number: ret.OBTNumber })
              .eq('id', matched.id);
            allResults.push({ orderNumber: ret.OrderId, obtNumber: ret.OBTNumber });
          }
        }
      } else {
        errors.push(`宅配：${result.Message || 'API 回傳錯誤'}`);
      }
    } catch (err: any) {
      errors.push(`宅配：${err.message || 'API 呼叫失敗'}`);
    }
  }

  // --- B2S batch (single printOBTByB2S call) ---
  if (b2sOrders.length > 0) {
    const b2sPrintOrders = b2sOrders.map((order) => ({
      orderId: order.order_number,
      thermosphere: getOrderThermosphere(order),
      spec: Spec.S60,
      receiveStoreId: order.store_id,
      recipientName: order.customer_name,
      recipientTel: stripPhone(order.customer_phone),
      recipientMobile: stripPhone(order.customer_phone),
      senderName,
      senderTel: senderPhone || senderMobile,
      senderMobile,
      senderZipCode: senderZip6,
      senderAddress,
      isCollection: order.payment_method === 'cod' ? 'Y' as const : 'N' as const,
      collectionAmount: order.payment_method === 'cod' ? Number(order.total) : 0,
      memo: order.note || '',
    }));

    try {
      const result = await printOBTByB2S({
        printOBTType: PrintOBTB2SType.A4Three,
        orders: b2sPrintOrders,
      });

      if (result.IsOK === 'Y' && result.Data) {
        fileNos.push(result.Data.FileNo);
        for (const ret of result.Data.Orders || []) {
          const matched = b2sOrders.find((o) => o.order_number === ret.OrderId);
          if (matched && ret.OBTNumber) {
            await adminDb
              .from('orders')
              .update({ tracking_number: ret.OBTNumber })
              .eq('id', matched.id);
            allResults.push({ orderNumber: ret.OrderId, obtNumber: ret.OBTNumber });
          }
        }
      } else {
        errors.push(`超商：${result.Message || 'API 回傳錯誤'}`);
      }
    } catch (err: any) {
      errors.push(`超商：${err.message || 'API 呼叫失敗'}`);
    }
  }

  if (allResults.length === 0 && errors.length > 0) {
    return NextResponse.json(
      { error: errors.join('；') },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    fileNo: fileNos[0] || null,
    fileNos,
    count: allResults.length,
    orders: allResults,
    ...(errors.length > 0 && { warnings: errors }),
  });
}

/**
 * PUT — 批量下載託運單 PDF
 * Body: { fileNo: string }
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { fileNo } = await request.json();
  if (!fileNo) {
    return NextResponse.json({ error: '缺少 fileNo' }, { status: 400 });
  }

  try {
    const pdfBuffer = await downloadOBT({ fileNo });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tcat-batch-${fileNo}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '下載託運單失敗' },
      { status: 500 },
    );
  }
}
