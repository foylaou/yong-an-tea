import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  printOBTByPickingList,
  downloadOBT,
  parseAddress,
  extractZipCode,
  clearTcatCache,
  getDeliverySettings,
  getNextDeliveryDate,
  PrintOBTType,
  Spec,
  DeliveryTime,
  ProductTypeId,
} from '@/lib/tcat';
import type { PrintOBTPickingOrder, PickingDetailBody } from '@/lib/tcat';

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
 * POST — 批量產生 T-Cat 撿貨明細託運單 (PrintOBTByPickingList)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const orderIds: string[] = body.orderIds || [];

  if (orderIds.length === 0) {
    return NextResponse.json({ error: '請選擇訂單' }, { status: 400 });
  }

  const adminDb = createAdminClient();

  // Fetch orders with items
  const { data: orders, error } = await adminDb
    .from('orders')
    .select('*, order_items(*)')
    .in('id', orderIds);

  if (error || !orders?.length) {
    return NextResponse.json({ error: '查無訂單' }, { status: 404 });
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
  const senderAddress = settings.tcat_sender_address;

  if (!senderName || !senderMobile || !senderAddress) {
    return NextResponse.json(
      { error: '寄件人資訊未完整設定，請至後台系統設定 → 物流設定填寫' },
      { status: 400 },
    );
  }

  clearTcatCache();

  // Parse sender zip
  let senderZip6 = '';
  try {
    const parseResult = await parseAddress({ addresses: [senderAddress] });
    if (parseResult.IsOK === 'Y' && parseResult.Data?.Addresses?.[0]) {
      senderZip6 = extractZipCode(parseResult.Data.Addresses[0].PostNumber);
    }
  } catch {
    // ignore
  }

  if (!senderZip6) {
    return NextResponse.json(
      { error: '無法解析寄件人地址的黑貓郵號' },
      { status: 400 },
    );
  }

  // Get product thermospheres
  const allProductIds = orders.flatMap((o: any) =>
    (o.order_items || []).map((i: any) => i.product_id).filter(Boolean),
  );
  const productThermospheres: Record<string, string> = {};
  if (allProductIds.length > 0) {
    const { data: products } = await adminDb
      .from('products')
      .select('id, thermosphere')
      .in('id', [...new Set(allProductIds)]);
    for (const p of products || []) {
      productThermospheres[p.id] = p.thermosphere || '0001';
    }
  }

  const today = new Date();
  const shipmentDate = formatDate(today);
  const deliveryOptions = await getDeliverySettings();
  const deliveryDateObj = await getNextDeliveryDate(today, deliveryOptions);
  const deliveryDate = formatDate(deliveryDateObj);

  // Only process 宅配 orders (B2S uses different format)
  const tcatOrders = orders.filter(
    (o: any) => o.shipping_method !== 'tcat_b2s',
  );

  if (tcatOrders.length === 0) {
    return NextResponse.json(
      { error: '所選訂單中沒有宅配訂單，撿貨明細僅支援宅配訂單' },
      { status: 400 },
    );
  }

  const pickingOrders: PrintOBTPickingOrder[] = tcatOrders.map((order: any) => {
    const items = order.order_items || [];
    const address = order.shipping_address || {};
    const recipientAddress = `${address.city || ''}${address.district || ''}${address.address_line1 || ''}${address.address_line2 || ''}`;

    // Detect thermosphere
    let orderThermosphere = '0001';
    for (const item of items) {
      const t = productThermospheres[item.product_id] || '0001';
      if (t === '0003') { orderThermosphere = '0003'; break; }
      if (t === '0002' && orderThermosphere !== '0003') orderThermosphere = '0002';
    }

    const detailBody: PickingDetailBody[] = items.map((item: any) => ({
      orderId: order.order_number,
      productTypeId: ProductTypeId.GeneralFood,
      productName: item.product_title || '商品',
      quantity: item.quantity,
      price: Number(item.price),
      amount: Number(item.subtotal),
    }));

    const totalQuantity = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

    return {
      obtNumber: order.tracking_number || '',
      orderId: order.order_number,
      thermosphere: orderThermosphere,
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
      productName: items.length === 1
        ? items[0].product_title
        : `${items[0]?.product_title || '商品'} 等${items.length}項`,
      memo: order.note || '',
      detail: {
        title: {
          column01: '品名',
          column02: '數量',
          column03: '單價',
          column04: '小計',
        },
        body: detailBody,
        totalQuantity,
        totalAmount: Number(order.subtotal),
        footer: {
          row01: `運費：${Number(order.shipping_fee) === 0 ? '免運' : `$${Number(order.shipping_fee)}`}`,
          row02: Number(order.cod_fee) > 0 ? `代收手續費：$${Number(order.cod_fee)}` : '',
          row03: `合計：$${Number(order.total)}`,
        },
      },
    };
  });

  try {
    const result = await printOBTByPickingList({
      printOBTType: PrintOBTType.A4Three,
      orders: pickingOrders,
    });

    if (result.IsOK !== 'Y' || !result.Data) {
      return NextResponse.json(
        { error: result.Message || '黑貓撿貨明細 API 回傳錯誤' },
        { status: 500 },
      );
    }

    // Update tracking numbers for orders that didn't have one
    const resultOrders = result.Data.Orders || [];
    for (const ro of resultOrders) {
      const matchOrder = tcatOrders.find((o: any) => o.order_number === ro.OBTNumber || !o.tracking_number);
      if (matchOrder && !matchOrder.tracking_number && ro.OBTNumber) {
        await adminDb
          .from('orders')
          .update({ tracking_number: ro.OBTNumber })
          .eq('id', matchOrder.id);
      }
    }

    const warnings: string[] = [];
    if (orders.length > tcatOrders.length) {
      warnings.push(`已跳過 ${orders.length - tcatOrders.length} 筆超商取貨訂單（撿貨明細不支援 B2S）`);
    }

    return NextResponse.json({
      success: true,
      fileNo: result.Data.FileNo,
      count: tcatOrders.length,
      warnings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '批量產生撿貨明細失敗' },
      { status: 500 },
    );
  }
}

/**
 * PUT — 下載撿貨明細 PDF (DownloadOBT)
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { fileNo } = body;
  if (!fileNo) {
    return NextResponse.json({ error: '缺少 fileNo' }, { status: 400 });
  }

  try {
    const pdfBuffer = await downloadOBT({ fileNo });
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tcat-picking-${fileNo}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '下載失敗' },
      { status: 500 },
    );
  }
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
