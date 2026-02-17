/**
 * One-time migration script: Markdown products → Supabase
 *
 * Usage: node --env-file=.env.local node_modules/.bin/tsx scripts/migrate-products.ts
 *
 * - Reads all .md files from src/data/products/
 * - Upserts into Supabase `products` table (by slug)
 * - Creates `product_categories` associations
 * - Safe to re-run (idempotent via upsert)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const PRODUCTS_DIR = path.join(process.cwd(), 'src/data/products');

async function main() {
    // 1. Read all markdown files
    const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.md'));
    console.log(`Found ${files.length} product markdown files`);

    // 2. Fetch existing categories from DB
    const { data: categories, error: catErr } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('is_active', true);

    if (catErr) {
        console.error('Error fetching categories:', catErr.message);
        process.exit(1);
    }

    const categoryMap = new Map<string, string>();
    for (const cat of categories ?? []) {
        categoryMap.set(cat.slug, cat.id);
    }
    console.log(`Found ${categoryMap.size} categories in DB:`, [...categoryMap.keys()].join(', '));

    // 3. Process each markdown file
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        const slug = file.replace(/\.md$/, '');
        const filePath = path.join(PRODUCTS_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const { data: fm, content } = matter(raw);

        // camelCase frontmatter → snake_case DB row
        const row: Record<string, any> = {
            legacy_id: fm.id ?? null,
            title: fm.title,
            slug,
            xs_image: fm.xsImage ?? null,
            sm_image: fm.smImage ?? null,
            md_image: fm.mdImage ?? null,
            home_collection_img: fm.homeCollectionImg ?? null,
            category_banner_img: fm.categoryBannerImg ?? null,
            alt_image: fm.altImage ?? null,
            price: fm.price ?? 0,
            discount_price: fm.discountPrice ?? null,
            desc_text: fm.desc ?? null,
            sku: fm.sku ?? null,
            availability: fm.availability ?? 'in-stock',
            size: fm.size ?? null,
            color: fm.color ?? null,
            tag: fm.tag ?? null,
            is_featured: fm.isFeatured ?? false,
            is_active: true,
            sold_out_sticker: fm.soldOutSticker ?? null,
            best_seller_sticker: fm.bestSellerSticker ?? null,
            offer_sticker: fm.offerSticker ?? null,
            sort_order: fm.sortOrder ?? 0,
            content: content.trim() || null,
        };

        // Upsert by slug
        const { data: product, error: upsertErr } = await supabase
            .from('products')
            .upsert(row, { onConflict: 'slug' })
            .select('id')
            .single();

        if (upsertErr) {
            console.error(`  [ERROR] ${slug}: ${upsertErr.message}`);
            errorCount++;
            continue;
        }

        const productId = product.id;

        // Handle category association
        const categorySlug = fm.category as string | undefined;
        if (categorySlug && categoryMap.has(categorySlug)) {
            const categoryId = categoryMap.get(categorySlug)!;

            // Delete existing associations for this product, then insert
            await supabase
                .from('product_categories')
                .delete()
                .eq('product_id', productId);

            const { error: pcErr } = await supabase
                .from('product_categories')
                .insert({ product_id: productId, category_id: categoryId });

            if (pcErr) {
                console.error(`  [WARN] ${slug}: category link failed — ${pcErr.message}`);
            }
        } else if (categorySlug) {
            console.warn(`  [WARN] ${slug}: category "${categorySlug}" not found in DB — skipping link`);
        }

        console.log(`  [OK] ${slug} (${fm.title})`);
        successCount++;
    }

    console.log(`\nDone. ${successCount} succeeded, ${errorCount} failed.`);
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
