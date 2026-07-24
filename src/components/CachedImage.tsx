import { ImgHTMLAttributes } from 'react';
import { useCachedImage } from '@/hooks/useCachedImage';

type CachedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
};

/**
 * Drop-in replacement for <img> that serves repeat views from an
 * IndexedDB blob cache instead of re-fetching over the network.
 */
function CachedImage({ src, ...rest }: CachedImageProps) {
  const cachedSrc = useCachedImage(src);
  return <img src={cachedSrc} {...rest} />;
}

export default CachedImage;
