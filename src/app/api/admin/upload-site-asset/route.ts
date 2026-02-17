import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED_KEYS = ['logo', 'favicon'];
const BUCKET = 'site-assets';

async function ensureBucket() {
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    await admin.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      fileSizeLimit: 2 * 1024 * 1024,
    });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const key = formData.get('key') as string | null;

  if (!file || !key) {
    return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
  }

  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: '不支援的 key' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '不支援的檔案類型，僅接受 JPEG、PNG、WebP、SVG' }, { status: 400 });
  }

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: '檔案大小不可超過 2MB' }, { status: 400 });
  }

  await ensureBucket();

  const admin = createAdminClient();
  const ext = file.name.split('.').pop() || 'png';
  const filePath = `${key}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return NextResponse.json({ url: urlData.publicUrl });
}
