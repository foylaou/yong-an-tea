import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  printOBTByPickingList,
  parseAddress,
  extractZipCode,
  clearTcatCache,
  getDeliverySettings,
  getNextDeliveryDate,
  PrintOBTType,
  Thermosphere,
  Spec,
  DeliveryTime,
  ProductTypeId,
} from '@/lib/tcat';
import type { PickingDetailBody } from '@/lib/tcat';

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
 * POST — 產生 T-Cat 撿貨明細託運單 (PrintOBTByPickingList)
 * 單一訂單
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

  clearTcatCache();

  if (!senderName || !senderMobile || !senderAddress || !senderZipCode) {
    return NextResponse.json(
      { error: '寄件人資訊未完整設定，請至後台系統設定 → 物流設定填寫' },
      { status: 400 },
    );
  }

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
      { error: '無法解析寄件人地址的黑貓郵號，請確認寄件人地址是否正確' },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const items = order.order_items || [];

  // Auto-detect thermosphere
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

  const address = order.shipping_address || {};
  const recipientAddress = `${address.city || ''}${address.district || ''}${address.address_line1 || ''}${address.address_line2 || ''}`;

  const today = new Date();
  const shipmentDate = formatDate(today);
  const deliveryOptions = await getDeliverySettings();
  const deliveryDateObj = await getNextDeliveryDate(today, deliveryOptions);
  const deliveryDate = formatDate(deliveryDateObj);

  // Build picking detail body from order items
  const detailBody: PickingDetailBody[] = items.map((item: any) => ({
    orderId: order.order_number,
    productTypeId: body.productTypeId || ProductTypeId.GeneralFood,
    productName: item.product_title || '商品',
    quantity: item.quantity,
    price: Number(item.price),
    amount: Number(item.subtotal),
  }));

  const totalQuantity = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
  const totalAmount = Number(order.subtotal);

  try {
    const result = await printOBTByPickingList({
      printOBTType: body.printOBTType || PrintOBTType.A4Three,
      orders: [
        {
          obtNumber: order.tracking_number || '',
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
            totalAmount,
            footer: {
              row01: `運費：${Number(order.shipping_fee) === 0 ? '免運' : `$${Number(order.shipping_fee)}`}`,
              row02: Number(order.cod_fee) > 0 ? `代收手續費：$${Number(order.cod_fee)}` : '',
              row03: `合計：$${Number(order.total)}`,
            },
          },
        },
      ],
    });

    if (result.IsOK !== 'Y' || !result.Data) {
      return NextResponse.json(
        { error: result.Message || '黑貓撿貨明細 API 回傳錯誤' },
        { status: 500 },
      );
    }

    // If no tracking number yet, save the one from result
    const obtNumber = result.Data.Orders[0]?.OBTNumber;
    if (obtNumber && !order.tracking_number) {
      await adminDb
        .from('orders')
        .update({ tracking_number: obtNumber })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      obtNumber,
      fileNo: result.Data.FileNo,
      printDateTime: result.Data.PrintDateTime,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '產生撿貨明細託運單失敗' },
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
