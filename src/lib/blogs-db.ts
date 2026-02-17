import { createAdminClient } from './supabase/admin';
import type { MarkdownItem } from '../types';

// ---------------------------------------------------------------------------
// Image resolution: Supabase URL → use as-is; filename → local path
// ---------------------------------------------------------------------------
function resolveImage(slug: string, value: string | null | undefined): string {
    if (!value) return '';
    if (value.startsWith('http')) return value;
    return `/images/blogs/${slug}/${value}`;
}

// ---------------------------------------------------------------------------
// Map a Supabase blog row (snake_case) → MarkdownItem (camelCase)
// ---------------------------------------------------------------------------
function mapBlogRow(row: any): MarkdownItem {
    const slug = row.slug as string;

    return {
        uuid: row.id,
        id: row.legacy_id ?? row.id,
        title: row.title,
        slug,
        mediumImage: resolveImage(slug, row.medium_image),
        masonry: resolveImage(slug, row.masonry),
        largeImage: resolveImage(slug, row.large_image),
        extraLargeImage: resolveImage(slug, row.extra_large_image),
        altImage: row.alt_image ?? '',
        date: row.date ?? '',
        author: row.author ?? '',
        categoryItem: row.category_item ?? '',
        desc: row.desc_text ?? '',
        blockquoteDesc: row.blockquote_desc ?? '',
        singleImgOne: row.single_img_one ?? '',
        singleImgTwo: row.single_img_two ?? '',
        singleImgAlt: row.single_img_alt ?? '',
        isFeatured: row.is_featured ?? false,
        published: row.published ?? true,
        content: row.content ?? '',
    };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAllBlogs(): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getAllBlogs error:', error.message);
        return [];
    }

    return (data ?? []).map(mapBlogRow);
}

export async function getFeaturedBlogs(): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .eq('is_featured', true)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getFeaturedBlogs error:', error.message);
        return [];
    }

    return (data ?? []).map(mapBlogRow);
}

export async function getBlogBySlug(slug: string): Promise<MarkdownItem | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error || !data) {
        return null;
    }

    return mapBlogRow(data);
}

export async function getBlogsByCategory(categorySlug: string): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .eq('category_item', categorySlug)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getBlogsByCategory error:', error.message);
        return [];
    }

    return (data ?? []).map(mapBlogRow);
}

export async function getBlogsByTag(tagSlug: string): Promise<MarkdownItem[]> {
    const supabase = createAdminClient();

    // First get the tag id
    const { data: tagData, error: tagError } = await supabase
        .from('blog_tags')
        .select('id')
        .eq('slug', tagSlug)
        .single();

    if (tagError || !tagData) {
        return [];
    }

    // Get blog ids from blog_tag_map
    const { data: mapData, error: mapError } = await supabase
        .from('blog_tag_map')
        .select('blog_id')
        .eq('tag_id', tagData.id);

    if (mapError || !mapData || mapData.length === 0) {
        return [];
    }

    const blogIds = mapData.map((m) => m.blog_id);

    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .in('id', blogIds)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getBlogsByTag error:', error.message);
        return [];
    }

    return (data ?? []).map(mapBlogRow);
}

export async function getBlogCategories(): Promise<{ slug: string; name: string; count: number }[]> {
    const supabase = createAdminClient();

    // Get categories
    const { data: categories, error: catError } = await supabase
        .from('blog_categories')
        .select('slug, name')
        .order('name', { ascending: true });

    if (catError || !categories) {
        console.error('getBlogCategories error:', catError?.message);
        return [];
    }

    // Count published blogs per category
    const { data: blogs, error: blogError } = await supabase
        .from('blogs')
        .select('category_item')
        .eq('published', true);

    if (blogError) {
        console.error('getBlogCategories count error:', blogError.message);
        return categories.map((c) => ({ ...c, count: 0 }));
    }

    const countMap = new Map<string, number>();
    for (const b of blogs ?? []) {
        if (b.category_item) {
            countMap.set(b.category_item, (countMap.get(b.category_item) || 0) + 1);
        }
    }

    return categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        count: countMap.get(c.slug) || 0,
    }));
}

export async function getBlogTags(): Promise<{ slug: string; name: string }[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('blog_tags')
        .select('slug, name')
        .order('name', { ascending: true });

    if (error) {
        console.error('getBlogTags error:', error.message);
        return [];
    }

    return (data ?? []) as { slug: string; name: string }[];
}
