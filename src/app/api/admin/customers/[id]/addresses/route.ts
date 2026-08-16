import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyAdmin(supabase: any) {
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
 * A walk-in `customers` row that's linked to a website login (profile_id
 * set) may have saved addresses under that account — this surfaces them for
 * POS's ShippingAddressDialog "帶入會員資料" picker. Walk-ins with no
 * profile_id just get an empty list (nothing to pull from).
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await verifyAdmin(supabase);
    if (!admin) {
        return NextResponse.json({ error: '權限不足' }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data: customer } = await adminClient
        .from('customers')
        .select('profile_id')
        .eq('id', id)
        .maybeSingle();

    if (!customer?.profile_id) {
        return NextResponse.json({ addresses: [] });
    }

    const { data: addresses, error } = await adminClient
        .from('addresses')
        .select(
            'id, label, recipient_name, phone, postal_code, city, district, address_line1, address_line2, is_default'
        )
        .eq('user_id', customer.profile_id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: '讀取地址失敗' }, { status: 500 });
    }

    return NextResponse.json({ addresses: addresses ?? [] });
}
