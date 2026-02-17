import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

export async function GET() {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const { data: categories, error } = await supabase
    .from('blog_categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: categories || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug } = body;

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: '名稱和 Slug 為必填' }, { status: 400 });
  }

  const { data: category, error } = await supabase
    .from('blog_categories')
    .insert({ name: name.trim(), slug: slug.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug 已存在，請使用其他名稱' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category }, { status: 201 });
}
