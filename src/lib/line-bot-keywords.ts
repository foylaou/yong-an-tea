// Keyword lists shared between server-side dispatch (line-bot-handlers.ts,
// which pulls in createAdminClient and must stay server-only) and the
// client-side rich menu editor (which needs to offer these as presets for
// the "傳送文字訊息" button action, so an admin can't typo the trigger
// keyword by hand-typing it). Kept in its own file specifically so the
// editor doesn't have to import anything server-only to get at them.

export const ORDER_QUERY_KEYWORDS = ['訂單', '出貨', '到哪', '物流', '寄到'];
export const COUPON_QUERY_KEYWORDS = ['優惠', '折扣', '折扣碼', '優惠券'];

export interface BotTextPreset {
  value: string;
  label: string;
}

// The first keyword in each list doubles as the canonical trigger text a
// rich menu button sends — any of the others also match, but this is what
// gets filled in when the preset is picked.
export const BOT_TEXT_PRESETS: BotTextPreset[] = [
  { value: ORDER_QUERY_KEYWORDS[0], label: '查詢訂單出貨狀況' },
  { value: COUPON_QUERY_KEYWORDS[0], label: '查詢優惠券' },
];
