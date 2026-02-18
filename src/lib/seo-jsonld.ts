import type { MarkdownItem } from '../types';

export function buildProductJsonLd(product: MarkdownItem, siteUrl: string) {
  const image = product.mdImage || product.smImage || product.xsImage;
  const imageUrl = image?.startsWith('http') ? image : `${siteUrl}${image}`;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.desc || product.detailDesc || '',
    url: `${siteUrl}/products/${product.slug}`,
    ...(image && { image: imageUrl }),
    offers: {
      '@type': 'Offer',
      price: product.discountPrice ?? product.price,
      priceCurrency: 'TWD',
      availability:
        product.availability === 'in-stock'
          ? 'https://schema.org/InStock'
          : product.availability === 'pre-order'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/products/${product.slug}`,
    },
  };

  if (product.sku) {
    jsonLd.sku = product.sku;
  }

  return jsonLd;
}

export function buildArticleJsonLd(
  blog: { title: string; slug: string; date?: string; author?: string; desc_text?: string; medium_image?: string },
  siteUrl: string
) {
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    url: `${siteUrl}/blogs/${blog.slug}`,
  };

  if (blog.desc_text) {
    jsonLd.description = blog.desc_text;
  }

  if (blog.medium_image) {
    const img = blog.medium_image.startsWith('http')
      ? blog.medium_image
      : `${siteUrl}${blog.medium_image}`;
    jsonLd.image = img;
  }

  if (blog.date) {
    jsonLd.datePublished = blog.date;
  }

  if (blog.author) {
    jsonLd.author = {
      '@type': 'Person',
      name: blog.author,
    };
  }

  return jsonLd;
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
