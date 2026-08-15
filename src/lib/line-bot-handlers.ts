import { createAdminClient } from './supabase/admin';
import { getLineBotSettings, pushMessage, type LineMessage } from './line-bot';
import { ORDER_QUERY_KEYWORDS, COUPON_QUERY_KEYWORDS } from './line-bot-keywords';

// Kept separate from OrderStatusBadge's statusLabel (admin UI component) —
// bot conversation logic shouldn't depend on what's otherwise an
// admin-only component tree.
const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  processing: '處理中',
  shipped: '已出貨',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export function isOrderStatusQuery(text: string): boolean {
  return ORDER_QUERY_KEYWORDS.some((keyword) => text.includes(keyword));
}

export function isCouponQuery(text: string): boolean {
  return COUPON_QUERY_KEYWORDS.some((keyword) => text.includes(keyword));
}

function formatDiscount(discountType: string, discountValue: number): string {
  if (discountType === 'percentage') return `${discountValue}% 折扣`;
  if (discountType === 'fixed_amount') return `折抵 $${discountValue}`;
  return '免運費';
}

/**
 * Coupons are the "public" design (see conversation) — anyone can ask, no
 * LINE Login / member binding required, unlike order status. Reply-based,
 * same as order status, so this doesn't touch the push quota either.
 */
export async function buildCouponReply(): Promise<LineMessage[]> {
  const supabase = createAdminClient();

  const nowIso = new Date().toISOString();
  const { data: coupons } = await supabase
    .from('coupons')
    .select('code, description, discount_type, discount_value, expires_at, starts_at')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!coupons?.length) {
    return [{ type: 'text', text: '目前沒有進行中的優惠券活動，敬請期待！' }];
  }

  const text = coupons
    .map((c) => {
      const expiry = c.expires_at ? `\n使用期限：${new Date(c.expires_at).toLocaleDateString('zh-TW')}` : '';
      return `🎁 ${c.code}\n${c.description}\n優惠內容：${formatDiscount(c.discount_type, c.discount_value)}${expiry}`;
    })
    .join('\n\n');

  return [{ type: 'text', text: `目前優惠券：\n\n${text}` }];
}

/**
 * Fired once, right when a profile's line_user_id first gets set — see
 * establishLineSession() in line-login.ts, the one place that happens for
 * both the OAuth and LIFF login entry points. Push (not reply): there's no
 * incoming user message to reply to here, this is triggered by the login
 * flow itself. Best-effort — a failure here must never break login.
 */
export async function sendWelcomeCoupons(lineUserId: string): Promise<void> {
  const botSettings = await getLineBotSettings().catch(() => null);
  if (!botSettings?.enabled) return;

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const { data: coupons } = await supabase
    .from('coupons')
    .select('code, description, discount_type, discount_value, expires_at, starts_at')
    .eq('is_active', true)
    .eq('is_welcome_coupon', true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

  if (!coupons?.length) return;

  const messages: LineMessage[] = coupons.slice(0, 5).map((c) => {
    const expiry = c.expires_at ? `\n使用期限：${new Date(c.expires_at).toLocaleDateString('zh-TW')}` : '';
    return {
      type: 'text',
      text: `🎉 歡迎加入會員！送您一張優惠券\n\n代碼：${c.code}\n${c.description}\n優惠內容：${formatDiscount(c.discount_type, c.discount_value)}${expiry}`,
    };
  });

  await pushMessage(lineUserId, messages, botSettings.channelAccessToken).catch((err) => {
    console.error('[welcome coupons] push failed:', err);
  });
}

/**
 * Builds the reply for "where's my order" — triggered by the user's own
 * message (reply, not push), so it doesn't touch the monthly push quota.
 * Looks the LINE userId up against profiles.line_user_id, which is only
 * populated once someone has completed LINE Login on the storefront.
 */
export async function buildOrderStatusReply(lineUserId: string | undefined): Promise<LineMessage[]> {
  if (!lineUserId) {
    return [{ type: 'text', text: '無法辨識您的身分，請稍後再試。' }];
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('line_user_id', lineUserId)
    .maybeSingle();

  if (!profile) {
    return [{ type: 'text', text: '尚未綁定會員帳號，請先至網站使用 LINE 登入後再查詢訂單。' }];
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, status, tracking_number, total, created_at')
    .eq('customer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!orders?.length) {
    return [{ type: 'text', text: '目前查不到您的訂單紀錄。' }];
  }

  const text = orders
    .map((o) => {
      const label = ORDER_STATUS_LABEL[o.status] || o.status;
      const tracking = o.tracking_number ? `\n物流單號：${o.tracking_number}` : '';
      return `訂單 ${o.order_number}\n狀態：${label}\n金額：$${o.total}${tracking}`;
    })
    .join('\n\n');

  return [{ type: 'text', text }];
}
