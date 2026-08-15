import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { richMenuFormSchema } from '@/lib/validations/line-richmenu';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
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

  const { data, error } = await supabase.from('line_richmenus').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ richmenus: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = richMenuFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '格式不正確', details: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('line_richmenus')
    .insert({
      name: parsed.data.name,
      chat_bar_text: parsed.data.chat_bar_text,
      template: parsed.data.template,
      buttons: parsed.data.buttons,
      image_url: parsed.data.image_url,
      target: parsed.data.target,
    })
    .select()
    .single();

  if (error) {
    const isConflict = error.code === '23505';
    return NextResponse.json({ error: isConflict ? '這個名稱已經被使用了' : error.message }, { status: isConflict ? 409 : 500 });
  }

  return NextResponse.json({ richmenu: data });
}
