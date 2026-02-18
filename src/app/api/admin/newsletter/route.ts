import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { newsletterFormSchema } from '@/lib/validations/newsletter';
import { getNewsletters, createNewsletter } from '@/lib/newsletter-db';

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

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '20', 10);

  const { newsletters, total } = await getNewsletters(page, perPage);

  return NextResponse.json({ newsletters, total, page, perPage });
}

export async function POST(request: NextRequest) {
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

  const newsletter = await createNewsletter(result.data.subject, result.data.content_html);

  if (!newsletter) {
    return NextResponse.json({ error: '建立失敗' }, { status: 500 });
  }

  return NextResponse.json({ newsletter }, { status: 201 });
}
