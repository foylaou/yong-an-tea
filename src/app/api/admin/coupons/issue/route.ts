import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getLineBotSettings, pushMessage } from '@/lib/line-bot';
import { recordCouponRecipient } from '@/lib/coupons-db';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
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
 * Issues an existing coupon to one member over LINE — the "admin scans a
 * customer's QR at the counter, picks a coupon, sends it" flow. This is a
 * *push* (costs quota — a deliberate, one-off admin action, not something
 * that fires automatically), unlike the reply-based order-status query.
 *
 * The rich menu button that gets an admin here is UI convenience only, not
 * a security boundary — anyone who finds the LIFF URL could open the page,
 * so this route re-checks admin role itself regardless of how the request
 * arrived.
 */
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);
    if (!admin) {
        return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const customerId = body?.customerId;
    const couponId = body?.couponId;
    if (!customerId || !couponId) {
        return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // customers, not profiles — the QR code encodeCustomerQr() puts on a
    // member's barcode (CustomerQrModal) is a customers.id, a separate table
    // from Supabase Auth profiles (a customers row doesn't require the
    // person to ever have logged in / have a profile at all).
    const db = createAdminClient();
    const [{ data: customer }, { data: coupon }] = await Promise.all([
        db
            .from('customers')
            .select('id, name, line_user_id')
            .eq('id', customerId)
            .single(),
        db.from('coupons').select('*').eq('id', couponId).single(),
    ]);

    if (!customer) {
        return NextResponse.json({ error: '找不到會員' }, { status: 404 });
    }
    if (!customer.line_user_id) {
        return NextResponse.json(
            { error: '此會員尚未綁定 LINE 帳號，無法發送' },
            { status: 400 }
        );
    }
    if (!coupon) {
        return NextResponse.json({ error: '找不到優惠券' }, { status: 404 });
    }

    const botSettings = await getLineBotSettings().catch(() => null);
    if (!botSettings?.enabled) {
        return NextResponse.json(
            { error: 'LINE 官方帳號尚未啟用，請至後台設定' },
            { status: 400 }
        );
    }

    const discountText =
        coupon.discount_type === 'percentage'
            ? `${coupon.discount_value}% 折扣`
            : coupon.discount_type === 'fixed_amount'
              ? `折抵 $${coupon.discount_value}`
              : '免運費';

    const expiryLine = coupon.expires_at
        ? `\n使用期限：${new Date(coupon.expires_at).toLocaleDateString('zh-TW')}`
        : '';

    const text = `🎁 您獲得一張優惠券！\n\n代碼：${coupon.code}\n${coupon.description}\n優惠內容：${discountText}${expiryLine}`;

    try {
        await pushMessage(
            customer.line_user_id,
            [{ type: 'text', text }],
            botSettings.channelAccessToken
        );
    } catch (err) {
        console.error('[coupons/issue] pushMessage failed:', err);
        return NextResponse.json(
            { error: '發送失敗，請稍後再試' },
            { status: 502 }
        );
    }

    // This *is* the "admin-issued" grant — the whole point of this route
    // being separate from broadcast is that it targets one member without
    // making the coupon usable by everyone else too (see coupons.is_public).
    await recordCouponRecipient(couponId, customerId);

    return NextResponse.json({ ok: true, customerName: customer.name });
}
