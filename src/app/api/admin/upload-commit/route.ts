import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';

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

interface Target {
  slug: string;
  imageType: string;
  bucket: string;
  width: number;
  height: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const admin = createAdminClient();

  const body = await request.json();
  const { tempKey, crop, targets } = body as {
    tempKey: string;
    crop: { x: number; y: number; width: number; height: number };
    targets: Target[];
  };

  if (!tempKey || !crop || !targets?.length) {
    return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
  }

  try {
    // Download temp file
    const { data: fileData, error: downloadError } = await admin.storage
      .from('upload-temp')
      .download(tempKey);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: '暫存檔案不存在或已過期' }, { status: 404 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Crop the image
    const cropped = sharp(buffer).extract({
      left: Math.round(crop.x),
      top: Math.round(crop.y),
      width: Math.round(crop.width),
      height: Math.round(crop.height),
    });

    const croppedBuffer = await cropped.toBuffer();

    // Process each target
    const urls: Record<string, string> = {};

    await Promise.all(
      targets.map(async (target) => {
        const resized = await sharp(croppedBuffer)
          .resize(target.width, target.height, { fit: 'cover' })
          .webp({ quality: 85 })
          .toBuffer();

        const filePath = `${target.slug}/${target.imageType}.webp`;

        const { error: uploadError } = await admin.storage
          .from(target.bucket)
          .upload(filePath, resized, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`上傳 ${target.imageType} 失敗: ${uploadError.message}`);
        }

        const { data: urlData } = admin.storage
          .from(target.bucket)
          .getPublicUrl(filePath);

        urls[target.imageType] = urlData.publicUrl;
      }),
    );

    // Clean up temp file
    await admin.storage.from('upload-temp').remove([tempKey]);

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('upload-commit error:', err);
    const message = err instanceof Error ? err.message : '圖片處理失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
