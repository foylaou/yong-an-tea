import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { blogApiSchema } from '@/lib/validations/blog';

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
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || ''; // 'published' | 'draft' | ''

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('blogs')
    .select('*, blog_tag_map(tag_id, blog_tags(id, name, slug))', { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
  }

  if (category) {
    query = query.eq('category_item', category);
  }

  if (status === 'published') {
    query = query.eq('published', true);
  } else if (status === 'draft') {
    query = query.eq('published', false);
  }

  const { data: blogs, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    blogs: blogs || [],
    total: count || 0,
    page,
    perPage,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json();
  const result = blogApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { tag_ids, ...blogData } = result.data;

  // Insert blog
  const { data: blog, error: insertError } = await supabase
    .from('blogs')
    .insert(blogData)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Insert blog_tag_map
  if (tag_ids.length > 0) {
    const { error: tagError } = await supabase
      .from('blog_tag_map')
      .insert(
        tag_ids.map((tid) => ({
          blog_id: blog.id,
          tag_id: tid,
        }))
      );
    if (tagError) {
      return NextResponse.json({ error: tagError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ blog }, { status: 201 });
}
