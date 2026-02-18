const BRAND_COLOR = '#222';
const BRAND_NAME = '永安の茶';

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
<!-- Header -->
<tr><td style="background-color:${BRAND_COLOR};padding:24px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${BRAND_NAME}</h1>
</td></tr>
<!-- Content -->
<tr><td style="padding:32px 24px;">
${content}
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#fafafa;padding:16px 24px;text-align:center;border-top:1px solid #eee;">
<p style="margin:0;font-size:12px;color:#999;">&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

interface OrderItem {
  product_title: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: Record<string, string>;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
}

export function orderConfirmationEmail(order: OrderData, items: OrderItem[]): string {
  const address = order.shipping_address;
  const addressStr = [address.city, address.district, address.address_line1, address.address_line2]
    .filter(Boolean)
    .join('');

  const itemRows = items
    .map(
      (item) => `<tr>
<td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.product_title}</td>
<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">NT$${item.price.toLocaleString()}</td>
<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">NT$${item.subtotal.toLocaleString()}</td>
</tr>`
    )
    .join('');

  const content = `
<h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">訂單確認</h2>
<p style="color:#333;line-height:1.6;">親愛的 ${order.customer_name}，感謝您的訂購！</p>
<p style="color:#666;line-height:1.6;">訂單編號：<strong>${order.order_number}</strong></p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #eee;border-radius:4px;">
<thead>
<tr style="background-color:#fafafa;">
<th style="padding:10px 12px;text-align:left;font-size:13px;color:#666;">商品</th>
<th style="padding:10px 12px;text-align:center;font-size:13px;color:#666;">數量</th>
<th style="padding:10px 12px;text-align:right;font-size:13px;color:#666;">單價</th>
<th style="padding:10px 12px;text-align:right;font-size:13px;color:#666;">小計</th>
</tr>
</thead>
<tbody>
${itemRows}
</tbody>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
<tr><td style="padding:4px 0;color:#666;">商品小計</td><td style="padding:4px 0;text-align:right;color:#333;">NT$${order.subtotal.toLocaleString()}</td></tr>
<tr><td style="padding:4px 0;color:#666;">運費</td><td style="padding:4px 0;text-align:right;color:#333;">NT$${order.shipping_fee.toLocaleString()}</td></tr>
${order.discount_amount > 0 ? `<tr><td style="padding:4px 0;color:#666;">折扣</td><td style="padding:4px 0;text-align:right;color:#c00;">-NT$${order.discount_amount.toLocaleString()}</td></tr>` : ''}
<tr><td style="padding:8px 0;color:${BRAND_COLOR};font-weight:700;font-size:16px;border-top:2px solid #222;">總計</td><td style="padding:8px 0;text-align:right;color:${BRAND_COLOR};font-weight:700;font-size:16px;border-top:2px solid #222;">NT$${order.total.toLocaleString()}</td></tr>
</table>

<p style="color:#666;line-height:1.6;margin-top:16px;">收件地址：${addressStr}</p>
<p style="color:#999;font-size:13px;margin-top:24px;">如有任何問題，歡迎聯繫我們的客服。</p>`;

  return baseLayout(content);
}

export function shippingNotificationEmail(
  order: { order_number: string; customer_name: string },
  trackingNumber?: string
): string {
  const content = `
<h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">出貨通知</h2>
<p style="color:#333;line-height:1.6;">親愛的 ${order.customer_name}，您的訂單已出貨！</p>
<p style="color:#666;line-height:1.6;">訂單編號：<strong>${order.order_number}</strong></p>
${trackingNumber ? `<p style="color:#666;line-height:1.6;">追蹤編號：<strong>${trackingNumber}</strong></p>` : ''}
<p style="color:#999;font-size:13px;margin-top:24px;">如有任何問題，歡迎聯繫我們的客服。</p>`;

  return baseLayout(content);
}

export function newsletterWrapperEmail(contentHtml: string, unsubscribeUrl: string): string {
  const content = `
<div style="color:#333;line-height:1.6;">
${contentHtml}
</div>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
<p style="text-align:center;font-size:12px;color:#999;">
  不想再收到此電子報？<a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">點此退訂</a>
</p>`;

  return baseLayout(content);
}
