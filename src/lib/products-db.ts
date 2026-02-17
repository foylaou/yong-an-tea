import { createAdminClient } from './supabase/admin';
import type { MarkdownItem } from '../types';

// ---------------------------------------------------------------------------
// Image resolution: Supabase URL → use as-is; filename → local path
// ---------------------------------------------------------------------------
function resolveImage(slug: string, value: string | null | undefined): string {
    if (!value) return '';
    if (value.startsWith('http')) return value;
    return `/images/products/${slug}/${value}`;
}

// ---------------------------------------------------------------------------
// Map a Supabase product row (snake_case) → MarkdownItem (camelCase)
// ---------------------------------------------------------------------------
function mapProductRow(row: any): MarkdownItem {
    const slug = row.slug as string;

    return {
        uuid: row.id,
        id: row.legacy_id ?? row.id,
        title: row.title,
        slug,
        price: Number(row.price),
        discountPrice: row.discount_price ? Number(row.discount_price) : null,
        desc: row.desc_text ?? '',
        sku: row.sku ?? null,
        availability: row.availability ?? 'in-stock',
        size: row.size ?? '',
        color: row.color ?? '',
        tag: row.tag ?? '',
        isFeatured: row.is_featured ?? false,
        isNewArrival: row.is_new_arrival ?? false,
        showInBanner: row.show_in_banner ?? false,
        bannerOrder: row.banner_order ?? 0,
        isActive: row.is_active ?? true,
        xsImage: resolveImage(slug, row.xs_image),
        smImage: resolveImage(slug, row.sm_image),
        mdImage: resolveImage(slug, row.md_image),
        homeCollectionImg: resolveImage(slug, row.home_collection_img),
        categoryBannerImg: resolveImage(slug, row.category_banner_img),
        altImage: row.alt_image ?? '',
        soldOutSticker: row.sold_out_sticker ?? null,
        bestSellerSticker: row.best_seller_sticker ?? null,
        offerSticker: row.offer_sticker ?? null,
        sortOrder: row.sort_order ?? 0,
        content: row.content ?? '',
        // category slug from the joined categories table (first match)
        category: row.product_categories?.[0]?.categories?.slug ?? '',
    };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(categories(slug))')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getAllProducts error:', error.message);
        return [];
    }

    return (data ?? []).map(mapProductRow);
}

export async function getFeaturedProducts(): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(categories(slug))')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getFeaturedProducts error:', error.message);
        return [];
    }

    return (data ?? []).map(mapProductRow);
}

export async function getCategories(): Promise<{ slug: string; name: string }[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('categories')
        .select('slug, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('getCategories error:', error.message);
        return [];
    }

    return (data ?? []) as { slug: string; name: string }[];
}

export async function getProductBySlug(slug: string): Promise<MarkdownItem | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(categories(slug))')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return null;
    }

    return mapProductRow(data);
}
