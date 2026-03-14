import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { queryOBTStatus, StatusCodes } from '@/lib/tcat';

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
 * GET — 查詢訂單物流貨態 (管理員)
 */
export async function GET(
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
  const { data: order, error } = await adminDb
    .from('orders')
    .select('tracking_number')
    .eq('id', id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  if (!order.tracking_number) {
    return NextResponse.json({ error: '此訂單尚無物流編號' }, { status: 404 });
  }

  try {
    const result = await queryOBTStatus([order.tracking_number]);

    if (result.IsOK !== 'Y' || !result.Data?.OBTs?.length) {
      return NextResponse.json(
        { error: result.Message || '查詢失敗' },
        { status: 500 },
      );
    }

    const obt = result.Data.OBTs[0];
    return NextResponse.json({
      success: true,
      tracking: {
        obtNumber: obt.OBTNumber,
        currentStatus: obt.StatusName,
        currentStatusId: obt.StatusId,
        latestStation: obt.StationName,
        latestTime: obt.CreateDateTime,
        history: (obt.StatusList || []).map((s) => ({
          statusId: s.StatusId,
          statusName: s.StatusName || StatusCodes[s.StatusId] || s.StatusId,
          time: s.CreateDateTime,
          station: s.StationName,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '查詢物流狀態失敗' },
      { status: 500 },
    );
  }
}
