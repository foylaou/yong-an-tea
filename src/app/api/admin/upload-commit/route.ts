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

// 'white' (default) | 'edge' (average of a border strip) | 'average' (whole-image
// average) | '#rrggbb' (manual). Only used when fitMode === 'contain'.
type FillMode = 'white' | 'edge' | 'average' | string;

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

async function resolveBackgroundColor(buffer: Buffer, fillMode: FillMode | undefined) {
  if (fillMode && HEX_COLOR.test(fillMode)) {
    const hex = fillMode.slice(1);
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      alpha: 1,
    };
  }

  if (fillMode === 'average') {
    const { channels } = await sharp(buffer).stats();
    return {
      r: Math.round(channels[0].mean),
      g: Math.round(channels[1].mean),
      b: Math.round(channels[2].mean),
      alpha: 1,
    };
  }

  if (fillMode === 'edge') {
    const { width, height } = await sharp(buffer).metadata();
    if (!width || !height) return { r: 255, g: 255, b: 255, alpha: 1 };

    const border = Math.max(1, Math.min(width, height, Math.round(Math.min(width, height) * 0.05)));
    const strips = await Promise.all([
      sharp(buffer).extract({ left: 0, top: 0, width, height: border }).stats(), // top
      sharp(buffer).extract({ left: 0, top: height - border, width, height: border }).stats(), // bottom
      sharp(buffer).extract({ left: 0, top: 0, width: border, height }).stats(), // left
      sharp(buffer).extract({ left: width - border, top: 0, width: border, height }).stats(), // right
    ]);
    const sum = strips.reduce(
      (acc, s) => ({
        r: acc.r + s.channels[0].mean,
        g: acc.g + s.channels[1].mean,
        b: acc.b + s.channels[2].mean,
      }),
      { r: 0, g: 0, b: 0 },
    );
    return {
      r: Math.round(sum.r / strips.length),
      g: Math.round(sum.g / strips.length),
      b: Math.round(sum.b / strips.length),
      alpha: 1,
    };
  }

  // 'white' or unrecognized — safe default
  return { r: 255, g: 255, b: 255, alpha: 1 };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!(await verifyAdmin(supabase))) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const admin = createAdminClient();

  const body = await request.json();
  const { tempKey, crop, targets, fitMode, fillMode } = body as {
    tempKey: string;
    crop: { x: number; y: number; width: number; height: number };
    targets: Target[];
    fitMode?: 'cover' | 'contain';
    fillMode?: FillMode;
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

    // 'contain' avoids fit:'cover' upscaling/cropping into the subject when the
    // crop doesn't match the target aspect ratio (e.g. a 16:9 product photo that
    // would otherwise get its edges cut off) — the shortfall is padded with a
    // background color instead.
    const background = fitMode === 'contain' ? await resolveBackgroundColor(croppedBuffer, fillMode) : undefined;

    // Process each target
    const urls: Record<string, string> = {};

    await Promise.all(
      targets.map(async (target) => {
        let pipeline = sharp(croppedBuffer).resize(
          target.width,
          target.height,
          background ? { fit: 'contain', background } : { fit: 'cover' },
        );
        if (background) {
          // Flatten any transparency in the source onto the same background,
          // so it doesn't clash with the padding sharp adds around it.
          pipeline = pipeline.flatten({ background });
        }
        const resized = await pipeline.webp({ quality: 100 }).toBuffer();

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

        // Append cache-busting parameter so browsers fetch the new image
        urls[target.imageType] = `${urlData.publicUrl}?t=${Date.now()}`;
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
