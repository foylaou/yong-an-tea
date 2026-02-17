import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';

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
  const slug = formData.get('slug') as string | null;
  const imageType = formData.get('imageType') as string | null;
  const bucket = (formData.get('bucket') as string | null) || 'product-images';

  if (!file || !slug || !imageType) {
    return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '不支援的檔案類型，僅接受 JPEG、PNG、WebP、HEIC' }, { status: 400 });
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: '檔案大小不可超過 10MB' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert all formats to WebP via sharp
    const outputBuffer = await sharp(buffer)
      .rotate() // auto-rotate based on EXIF
      .webp({ quality: 85 })
      .toBuffer();

    const filePath = `${slug}/${imageType}.webp`;

    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(filePath, outputBuffer, {
        upsert: true,
        contentType: 'image/webp',
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('upload error:', err);
    return NextResponse.json({ error: '圖片處理失敗' }, { status: 500 });
  }
}
