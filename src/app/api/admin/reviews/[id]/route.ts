import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateReviewStatus, deleteReview } from '@/lib/reviews-db';
import { reviewAdminSchema } from '@/lib/validations/review';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = reviewAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ok = await updateReviewStatus(id, parsed.data.status);
  if (!ok) {
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { id } = await params;
  const ok = await deleteReview(id);
  if (!ok) {
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
