/**
 * Client-side image compression using canvas.
 * Resizes to maxSize and converts to WebP to stay under Vercel's 4.5MB body limit.
 */
const MAX_DIMENSION = 2000;
const QUALITY = 0.92;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB target

export async function compressImage(file: File): Promise<File> {
  // Skip if already small enough
  if (file.size <= MAX_FILE_SIZE && file.type === 'image/webp') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Calculate new dimensions
  let newW = width;
  let newH = height;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    newW = Math.round(width * ratio);
    newH = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(newW, newH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(bitmap, 0, 0, newW, newH);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: QUALITY });

  return new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
    type: 'image/webp',
  });
}
