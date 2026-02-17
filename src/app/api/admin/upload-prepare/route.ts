import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return profile?.role === 'admin';
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const admin = createAdminClient();

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: '缺少檔案' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: '不支援的檔案類型，僅接受 JPEG、PNG、WebP、HEIC' },
      { status: 400 },
    );
  }

  // 10MB limit for raw uploads (will be compressed)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: '檔案大小不可超過 10MB' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // sharp pipeline: auto-rotate → limit to 2000px → convert to webp
    const processed = sharp(buffer)
      .rotate() // auto-rotate based on EXIF
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 });

    const outputBuffer = await processed.toBuffer();
    const metadata = await sharp(outputBuffer).metadata();

    // Generate a unique temp key
    const tempKey = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const { error: uploadError } = await admin.storage
      .from('upload-temp')
      .upload(tempKey, outputBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage
      .from('upload-temp')
      .getPublicUrl(tempKey);

    return NextResponse.json({
      tempKey,
      previewUrl: urlData.publicUrl,
      width: metadata.width || 0,
      height: metadata.height || 0,
    });
  } catch (err) {
    console.error('upload-prepare error:', err);
    return NextResponse.json({ error: '圖片處理失敗' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { tempKey } = await request.json();
  if (!tempKey) {
    return NextResponse.json({ error: '缺少 tempKey' }, { status: 400 });
  }

  await admin.storage.from('upload-temp').remove([tempKey]);
  return NextResponse.json({ ok: true });
}
