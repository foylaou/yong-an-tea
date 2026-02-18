import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { newsletterFormSchema } from '@/lib/validations/newsletter';
import { getNewsletterById, updateNewsletter, deleteNewsletter } from '@/lib/newsletter-db';

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

  const newsletter = await getNewsletterById(id);
  if (!newsletter) {
    return NextResponse.json({ error: '電子報不存在' }, { status: 404 });
  }

  return NextResponse.json({ newsletter });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = newsletterFormSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const newsletter = await updateNewsletter(id, result.data.subject, result.data.content_html);
  if (!newsletter) {
    return NextResponse.json({ error: '更新失敗（僅草稿可編輯）' }, { status: 400 });
  }

  return NextResponse.json({ newsletter });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const success = await deleteNewsletter(id);
  if (!success) {
    return NextResponse.json({ error: '刪除失敗（僅草稿可刪除）' }, { status: 400 });
  }

  return NextResponse.json({ message: '已刪除' });
}
