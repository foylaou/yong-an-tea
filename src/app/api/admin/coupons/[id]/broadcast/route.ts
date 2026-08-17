import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getLineBotSettings, multicastMessage } from '@/lib/line-bot';

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

function formatDiscount(discountType: string, discountValue: number): string {
    if (discountType === 'percentage') return `${discountValue}% 折扣`;
    if (discountType === 'fixed_amount') return `折抵 $${discountValue}`;
    return '免運費';
}

/**
 * One-time push of a single coupon to every *currently* LINE-bound member
 * (profiles.line_user_id IS NOT NULL) — the "anniversary sale" case, as
 * opposed to is_welcome_coupon which keeps firing for members who join
 * later. Uses multicast (single API call, one push-quota charge per
 * recipient either way) rather than looping individual push calls.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);
    if (!admin) {
        return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    const db = createAdminClient();
    const { data: coupon } = await db
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();
    if (!coupon) {
        return NextResponse.json(
            { error: '找不到這張優惠券' },
            { status: 404 }
        );
    }

    const botSettings = await getLineBotSettings().catch(() => null);
    if (!botSettings?.enabled) {
        return NextResponse.json(
            { error: 'LINE 官方帳號尚未啟用，請至後台設定' },
            { status: 400 }
        );
    }

    const { data: members } = await db
        .from('profiles')
        .select('line_user_id')
        .not('line_user_id', 'is', null);
    const userIds = (members ?? []).map((m) => m.line_user_id as string);
    if (!userIds.length) {
        return NextResponse.json(
            { error: '目前沒有已綁定 LINE 的會員' },
            { status: 400 }
        );
    }

    // Broadcasting to everyone *is* what makes a coupon public — see
    // coupons.is_public's doc comment. Without this, a 限定發放 coupon that
    // gets broadcast would still reject everyone who wasn't individually
    // issued a coupon_recipients grant, contradicting the whole point of
    // sending it to all of them.
    if (!coupon.is_public) {
        await db.from('coupons').update({ is_public: true }).eq('id', id);
    }

    const expiryLine = coupon.expires_at
        ? `\n使用期限：${new Date(coupon.expires_at).toLocaleDateString('zh-TW')}`
        : '';
    const text = `🎁 您獲得一張優惠券！\n\n代碼：${coupon.code}\n${coupon.description}\n優惠內容：${formatDiscount(coupon.discount_type, coupon.discount_value)}${expiryLine}`;

    // LINE's multicast endpoint takes up to 500 recipients per call — chunk
    // rather than assume the member list stays under that forever.
    const CHUNK_SIZE = 500;
    let sent = 0;
    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
        const chunk = userIds.slice(i, i + CHUNK_SIZE);
        try {
            await multicastMessage(
                chunk,
                [{ type: 'text', text }],
                botSettings.channelAccessToken
            );
            sent += chunk.length;
        } catch (err) {
            console.error('[coupons broadcast] chunk failed:', err);
        }
    }

    return NextResponse.json({ ok: true, sent, total: userIds.length });
}
