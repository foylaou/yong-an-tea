import Head from 'next/head';
import type { SEOData } from '@/lib/seo-db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

interface FallbackData {
  title?: string;
  description?: string;
  image?: string;
}

interface SEOHeadProps {
  seo?: SEOData | null;
  fallback?: FallbackData;
  path?: string;
}

function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function SEOHead({ seo, fallback, path }: SEOHeadProps) {
  const title = seo?.meta_title || fallback?.title || '';
  const description = seo?.meta_description || fallback?.description || '';
  const image = toAbsoluteUrl(seo?.og_image || fallback?.image);
  const canonical = seo?.canonical_url || (path ? `${SITE_URL}${path}` : undefined);

  const ogTitle = seo?.og_title || title;
  const ogDescription = seo?.og_description || description;
  const ogType = seo?.og_type || 'website';

  const twitterCard = seo?.twitter_card || 'summary_large_image';
  const twitterTitle = seo?.twitter_title || ogTitle;
  const twitterDescription = seo?.twitter_description || ogDescription;
  const twitterImage = toAbsoluteUrl(seo?.twitter_image) || image;

  const robotsDirectives: string[] = [];
  if (seo?.no_index) robotsDirectives.push('noindex');
  if (seo?.no_follow) robotsDirectives.push('nofollow');
  const robots = robotsDirectives.length > 0 ? robotsDirectives.join(', ') : undefined;

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {seo?.meta_keywords && <meta name="keywords" content={seo.meta_keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {robots && <meta name="robots" content={robots} />}

      {/* OpenGraph */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogType && <meta property="og:type" content={ogType} />}
      {image && <meta property="og:image" content={image} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
    </Head>
  );
}
