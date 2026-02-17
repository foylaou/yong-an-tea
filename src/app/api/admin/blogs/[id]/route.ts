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
  const result = blogApiSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: '驗證失敗', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { tag_ids, ...blogData } = result.data;

  // Update blog
  const { data: blog, error: updateError } = await supabase
    .from('blogs')
    .update(blogData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Rebuild blog_tag_map: delete all then re-insert
  await supabase.from('blog_tag_map').delete().eq('blog_id', id);

  if (tag_ids.length > 0) {
    const { error: tagError } = await supabase
      .from('blog_tag_map')
      .insert(
        tag_ids.map((tid) => ({
          blog_id: id,
          tag_id: tid,
        }))
      );
    if (tagError) {
      return NextResponse.json({ error: tagError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ blog });
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

  const { searchParams } = new URL(request.url);
  const hard = searchParams.get('hard') === 'true';

  if (hard) {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Soft delete: set published = false
    const { error } = await supabase
      .from('blogs')
      .update({ published: false })
      .eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
