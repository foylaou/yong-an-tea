import crypto from 'crypto';
import { createAdminClient } from './supabase/admin';

export interface LineBotSettings {
    enabled: boolean;
    channelId: string;
    channelSecret: string;
    channelAccessToken: string;
    basicId: string;
    liffId: string;
    // Fallback reply for messages that don't match any keyword dispatch — see
    // resolveReply() in the webhook route.
    defaultReplyEnabled: boolean;
    defaultReply: string;
}

const DEFAULT_FALLBACK_REPLY =
    '目前可以輸入「訂單」查詢出貨狀況，或輸入「優惠」查詢目前的優惠券。';

let cachedSettings: LineBotSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute — same convention as line-pay.ts / tcat.ts

export async function getLineBotSettings(): Promise<LineBotSettings> {
    const now = Date.now();
    if (cachedSettings && now - cacheTime < CACHE_TTL) {
        return cachedSettings;
    }

    // Secrets live in protected_settings; basic_id/liff_id live in
    // site_settings (line_bot_public) since they have to be publicly
    // readable client-side — see 20260815000002's migration comment.
    const supabase = createAdminClient();
    const [
        { data: secretRows, error: secretError },
        { data: publicRows, error: publicError },
    ] = await Promise.all([
        supabase
            .from('protected_settings')
            .select('key, value')
            .eq('group', 'line_bot'),
        supabase
            .from('site_settings')
            .select('key, value')
            .eq('group', 'line_bot_public'),
    ]);

    if (secretError || publicError || !secretRows || !publicRows) {
        throw new Error(
            '無法讀取 LINE 官方帳號設定，請至後台系統設定 > LINE 官方帳號頁面填入'
        );
    }

    const settings: Record<string, unknown> = {};
    for (const row of [...secretRows, ...publicRows]) {
        settings[row.key] = row.value;
    }

    const result: LineBotSettings = {
        enabled: Boolean(settings.line_bot_enabled),
        channelId: String(settings.line_bot_channel_id ?? ''),
        channelSecret: String(settings.line_bot_channel_secret ?? ''),
        channelAccessToken: String(
            settings.line_bot_channel_access_token ?? ''
        ),
        basicId: String(settings.line_bot_basic_id ?? ''),
        liffId: String(settings.line_bot_liff_id ?? ''),
        // Default to "on" with the original hardcoded text when the row hasn't
        // been seeded yet (settings undefined), not when the admin explicitly
        // unchecked it (settings === false).
        defaultReplyEnabled:
            settings.line_bot_default_reply_enabled === undefined
                ? true
                : Boolean(settings.line_bot_default_reply_enabled),
        defaultReply:
            String(settings.line_bot_default_reply ?? DEFAULT_FALLBACK_REPLY) ||
            DEFAULT_FALLBACK_REPLY,
    };

    cachedSettings = result;
    cacheTime = now;
    return result;
}

/**
 * Verifies the X-Line-Signature header LINE attaches to every webhook
 * request: base64(HMAC-SHA256(channelSecret, rawRequestBody)). Must run
 * against the *raw* request body string — parsing to JSON and
 * re-serializing before verifying will produce a different byte sequence
 * and always fail.
 */
export function verifyLineSignature(
    rawBody: string,
    signature: string | null,
    channelSecret: string
): boolean {
    if (!signature || !channelSecret) return false;

    const expected = crypto
        .createHmac('sha256', channelSecret)
        .update(rawBody)
        .digest('base64');

    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) return false;

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

// Minimal message shape — extend with sticker/image/flex message variants as
// actual bot features (coupon cards, order status, etc.) get built.
export type LineMessage = { type: 'text'; text: string };

async function callMessagingApi(
    path: string,
    body: unknown,
    accessToken: string
): Promise<void> {
    const res = await fetch(`https://api.line.me${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(
            `LINE Messaging API ${path} failed: ${res.status} ${errText}`
        );
    }
}

/**
 * Free — replyToken comes from an incoming webhook event and only works
 * once, within a short window. Use this for anything triggered by a user
 * message (order status queries, "my coupons"), not for proactive
 * notifications — it doesn't count against the monthly push quota.
 */
export async function replyMessage(
    replyToken: string,
    messages: LineMessage[],
    accessToken: string
): Promise<void> {
    await callMessagingApi(
        '/v2/bot/message/reply',
        { replyToken, messages },
        accessToken
    );
}

/**
 * Counts against the channel's monthly push message quota — use sparingly,
 * for actual state-change notifications (order shipped, coupon issued),
 * not anything a reply could have handled instead.
 */
export async function pushMessage(
    to: string,
    messages: LineMessage[],
    accessToken: string
): Promise<void> {
    await callMessagingApi(
        '/v2/bot/message/push',
        { to, messages },
        accessToken
    );
}

/**
 * Same quota/use-case as pushMessage, but for many recipients in one call —
 * LINE's /push endpoint only ever takes a single `to`; sending an array
 * there is silently wrong, not just slow. `to` is capped at 500 per LINE's
 * own limit — callers with more recipients need to chunk themselves.
 */
export async function multicastMessage(
    to: string[],
    messages: LineMessage[],
    accessToken: string
): Promise<void> {
    await callMessagingApi(
        '/v2/bot/message/multicast',
        { to, messages },
        accessToken
    );
}
