import { useEffect, useState } from 'react';
import { getCachedImage, putCachedImage } from '@/lib/image-cache';

function isCacheable(src?: string): src is string {
  return !!src && !src.startsWith('data:') && !src.startsWith('blob:');
}

/**
 * Returns a display URL for `src`, transparently backed by an IndexedDB
 * blob cache. Falls back to the original `src` until the cached/fetched
 * blob is ready, so there is never a broken or blank image.
 */
export function useCachedImage(src?: string): string | undefined {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    setDisplaySrc(src);

    if (!isCacheable(src)) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const cached = await getCachedImage(src);
        if (cached) {
          objectUrl = URL.createObjectURL(cached);
          if (!cancelled) setDisplaySrc(objectUrl);
          return;
        }

        const res = await fetch(src);
        if (!res.ok) return;
        const blob = await res.blob();

        await putCachedImage(src, blob);

        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setDisplaySrc(objectUrl);
      } catch {
        // Network/IndexedDB errors: keep showing the original src.
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return displaySrc;
}
