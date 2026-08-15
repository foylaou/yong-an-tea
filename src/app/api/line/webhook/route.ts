import { NextRequest, NextResponse } from 'next/server';
import {
    getLineBotSettings,
    verifyLineSignature,
    replyMessage,
    type LineMessage,
    type LineBotSettings,
} from '@/lib/line-bot';
import {
    isOrderStatusQuery,
    buildOrderStatusReply,
    isCouponQuery,
    buildCouponReply,
} from '@/lib/line-bot-handlers';

interface LineWebhookEvent {
    type: string;
    replyToken?: string;
    source?: { type: string; userId?: string };
    message?: { type: string; text?: string };
    postback?: { data: string };
}

// LINE requires a fast 200 response and, separately, calls this endpoint with
// an empty `events` array (no signature-worthy body) when you hit "Verify" in
// the console — both are handled below, ahead of any real event processing.
export async function POST(request: NextRequest) {
    const settings = await getLineBotSettings().catch(() => null);
    if (!settings?.enabled) {
        // Not configured / intentionally off — 200 so LINE doesn't retry, but do
        // nothing. Avoids failing webhook verification while settings are still
        // being filled in.
        return NextResponse.json({ ok: true });
    }

    // Signature verification needs the *raw* body — read it once as text, and
    // parse that same string, rather than request.json() (which would consume
    // the stream and leave nothing to verify against).
    const rawBody = await request.text();
    const signature = request.headers.get('x-line-signature');

    if (!verifyLineSignature(rawBody, signature, settings.channelSecret)) {
        return NextResponse.json(
            { error: 'invalid signature' },
            { status: 401 }
        );
    }

    let events: LineWebhookEvent[] = [];
    try {
        events = JSON.parse(rawBody).events ?? [];
    } catch {
        return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }

    // Handle events best-effort and don't let one failure block the others —
    // LINE doesn't need per-event status back, just an overall 200.
    await Promise.allSettled(
        events.map((event) => handleEvent(event, settings))
    );

    return NextResponse.json({ ok: true });
}

/**
 * Shared by message text and postback data — same keyword-based dispatch
 * either way. Falls through to the admin-configured default reply when
 * nothing matches; an empty array means "stay silent", which callers must
 * skip replying on rather than calling replyMessage with no messages (LINE
 * rejects an empty `messages` array).
 */
async function resolveReply(
    text: string,
    lineUserId: string | undefined,
    settings: LineBotSettings
): Promise<LineMessage[]> {
    if (isOrderStatusQuery(text)) return buildOrderStatusReply(lineUserId);
    if (isCouponQuery(text)) return buildCouponReply();
    if (!settings.defaultReplyEnabled) return [];
    return [{ type: 'text', text: settings.defaultReply }];
}

async function handleEvent(event: LineWebhookEvent, settings: LineBotSettings) {
    if (
        event.type === 'message' &&
        event.message?.type === 'text' &&
        event.replyToken
    ) {
        const text = event.message.text ?? '';
        console.log(
            '[line webhook] text message from',
            event.source?.userId,
            ':',
            text
        );
        const reply = await resolveReply(text, event.source?.userId, settings);
        if (reply.length > 0) {
            await replyMessage(
                event.replyToken,
                reply,
                settings.channelAccessToken
            );
        }
        return;
    }

    if (event.type === 'postback') {
        const data = event.postback?.data ?? '';
        console.log(
            '[line webhook] postback from',
            event.source?.userId,
            ':',
            data
        );

        // Rich menu switch actions send their own postback (see the `data:
        // switch:<name>` set when resolving richmenuswitch actions in the
        // apply route) purely so we have a record of it — LINE already
        // switched the menu client-side, there's nothing to reply to here.
        if (data.startsWith('switch:')) return;

        if (event.replyToken) {
            const reply = await resolveReply(
                data,
                event.source?.userId,
                settings
            );
            if (reply.length > 0) {
                await replyMessage(
                    event.replyToken,
                    reply,
                    settings.channelAccessToken
                );
            }
        }
        return;
    }

    console.log('[line webhook] unhandled event type:', event.type);
}
