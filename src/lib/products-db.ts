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
function mapVariant(v: any) {
    return {
        id: v.id,
        name: v.name,
        price: Number(v.price),
        discountPrice: v.discount_price ? Number(v.discount_price) : null,
        stockQty: v.stock_qty ?? 0,
        sku: v.sku ?? null,
        isActive: v.is_active ?? true,
        imageIndex: v.image_index ?? null,
    };
}

function mapProductRow(row: any): MarkdownItem {
    const slug = row.slug as string;

    // Map variants if joined
    const variants = row.product_variants
        ?.filter((v: any) => v.is_active !== false)
        ?.map(mapVariant) ?? [];

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
        thermosphere: row.thermosphere ?? '0001',
        stockQty: row.stock_qty ?? 0,
        maxQty: row.max_qty ?? 0,
        detailDesc: row.detail_desc ?? '',
        features: row.features ?? '',
        attributesJson: row.attributes_json ?? '[]',
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
        puckData: row.puck_data || null,
        // category slugs from the joined categories table
        category: (row.product_categories ?? []).map((pc: any) => pc.categories?.slug).filter(Boolean),
        avgRating: Number(row.avg_rating) || 0,
        reviewCount: row.review_count ?? 0,
        variants,
        // Gallery images sorted by sort_order
        images: (row.product_images ?? [])
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((img: any) => ({
                id: img.id,
                smUrl: img.sm_url,
                mdUrl: img.md_url,
                altText: img.alt_text ?? '',
            })),
    };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(categories(slug)), product_variants(*), product_images(*)')
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
        .select('*, product_categories(categories(slug)), product_variants(*), product_images(*)')
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

export async function getBestsellingProducts(limit = 5): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    // Read bestseller settings
    const { data: settingsRows } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('group', 'bestseller');

    const settings: Record<string, string> = {};
    for (const row of settingsRows ?? []) {
        settings[row.key] = row.value as string;
    }

    const mode = settings.bestseller_mode || 'auto';

    if (mode === 'custom') {
        let ids: string[] = [];
        try { ids = JSON.parse(settings.bestseller_product_ids || '[]'); } catch { /* ignore */ }
        if (!ids.length) return [];

        const { data, error } = await supabase
            .from('products')
            .select('*, product_categories(categories(slug)), product_variants(*), product_images(*)')
            .in('id', ids)
            .eq('is_active', true);

        if (error || !data) return [];

        const mapped = data.map(mapProductRow);
        const byId = new Map(mapped.map((p) => [p.uuid, p]));
        return ids.map((id) => byId.get(id)).filter(Boolean) as MarkdownItem[];
    }

    // Auto mode: top products by sales quantity from order_items
    const { data: topItems, error: topErr } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .limit(1000);

    if (topErr || !topItems?.length) {
        // Fallback to default sort
        const { data } = await supabase
            .from('products')
            .select('*, product_categories(categories(slug)), product_variants(*), product_images(*)')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .limit(limit);
        return (data ?? []).map(mapProductRow);
    }

    // Aggregate sales by product_id
    const salesMap = new Map<string, number>();
    for (const item of topItems) {
        salesMap.set(item.product_id, (salesMap.get(item.product_id) ?? 0) + item.quantity);
    }
    const topIds = [...salesMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

    if (!topIds.length) return [];

    const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(categories(slug)), product_variants(*), product_images(*)')
        .in('id', topIds)
        .eq('is_active', true);

    if (error || !data) return [];

    const mapped = data.map(mapProductRow);
    const byId = new Map(mapped.map((p) => [p.uuid, p]));
    return topIds.map((id) => byId.get(id)).filter(Boolean) as MarkdownItem[];
}

export async function getProductBySlug(slug: string): Promise<MarkdownItem | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('products')
        .select('*, product_categories(categories(slug)), product_variants(*), product_images(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return null;
    }

    return mapProductRow(data);
}
