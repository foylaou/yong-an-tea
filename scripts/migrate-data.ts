import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DATA_DIR = path.join(process.cwd(), 'src/data');

function readMarkdownFiles(type: string) {
  const dir = path.join(DATA_DIR, type);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    return { slug: file.replace(/\.md$/, ''), ...data, content };
  });
}

async function migrateProducts() {
  console.log('--- Migrating Products ---');

  const items = readMarkdownFiles('products') as any[];

  // 1. Collect unique categories
  const categoryNames = [...new Set(items.map((p) => p.category as string))];
  console.log(`Found ${categoryNames.length} categories:`, categoryNames);

  // Upsert categories
  const categoryMap: Record<string, string> = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error) {
      console.error(`  Category "${name}" error:`, error.message);
      continue;
    }
    categoryMap[name] = data.id;
    console.log(`  Category "${name}" -> ${data.id}`);
  }

  // 2. Upsert products
  for (const item of items) {
    const row = {
      legacy_id: item.id,
      title: item.title,
      slug: item.slug,
      xs_image: item.xsImage || null,
      sm_image: item.smImage || null,
      md_image: item.mdImage || null,
      home_collection_img: item.homeCollectionImg || null,
      alt_image: item.altImage || null,
      price: item.price || 0,
      discount_price: item.discountPrice || null,
      desc_text: item.desc || null,
      sku: item.sku || null,
      availability: item.availability || 'in-stock',
      size: item.size || null,
      color: item.color || null,
      tag: item.tag || null,
      is_featured: item.isFeatured || false,
      is_active: true,
      sold_out_sticker: item.soldOutSticker || null,
      best_seller_sticker: item.bestSellerSticker || null,
      offer_sticker: item.offerSticker || null,
      content: item.content || null,
    };

    const { data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  Product "${item.title}" error:`, error.message);
      continue;
    }

    console.log(`  Product "${item.title}" -> ${data.id}`);

    // Link product to category
    const catId = categoryMap[item.category];
    if (catId) {
      const { error: linkErr } = await supabase
        .from('product_categories')
        .upsert({ product_id: data.id, category_id: catId });
      if (linkErr) {
        console.error(`    Link error:`, linkErr.message);
      }
    }
  }

  console.log(`Migrated ${items.length} products.\n`);
}

async function migrateBlogs() {
  console.log('--- Migrating Blogs ---');

  const items = readMarkdownFiles('blogs') as any[];

  // 1. Collect unique blog categories and tags
  const allCategories = new Set<string>();
  const allTags = new Set<string>();

  for (const item of items) {
    // Category from categoryItem field (simple string like "furniture")
    if (item.categoryItem) {
      allCategories.add(item.categoryItem);
    }
    // Tags from tag array
    if (Array.isArray(item.tag)) {
      item.tag.forEach((t: string) => {
        if (t !== 'all') allTags.add(t);
      });
    }
  }

  console.log(`Found ${allCategories.size} blog categories:`, [...allCategories]);
  console.log(`Found ${allTags.size} blog tags:`, [...allTags]);

  // Upsert blog categories
  const catMap: Record<string, string> = {};
  for (const name of allCategories) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('blog_categories')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error) {
      console.error(`  Blog category "${name}" error:`, error.message);
      continue;
    }
    catMap[name] = data.id;
    console.log(`  Blog category "${name}" -> ${data.id}`);
  }

  // Upsert blog tags
  const tagMap: Record<string, string> = {};
  for (const name of allTags) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('blog_tags')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error) {
      console.error(`  Blog tag "${name}" error:`, error.message);
      continue;
    }
    tagMap[name] = data.id;
    console.log(`  Blog tag "${name}" -> ${data.id}`);
  }

  // 2. Upsert blogs
  for (const item of items) {
    const row = {
      legacy_id: item.id,
      title: item.title,
      slug: item.slug,
      medium_image: item.mediumImage || null,
      masonry: item.masonry || null,
      large_image: item.largeImage || null,
      extra_large_image: item.extraLargeImage || null,
      alt_image: item.altImage || null,
      date: item.date || null,
      author: item.author || null,
      category_item: item.categoryItem || null,
      desc_text: item.desc || null,
      blockquote_desc: item.blockquoteDesc || null,
      single_img_one: item.singleImgOne || null,
      single_img_two: item.singleImgTwo || null,
      single_img_alt: item.singleImgAlt || null,
      content: item.content || null,
      is_featured: item.isFeatured || false,
      published: true,
    };

    const { data, error } = await supabase
      .from('blogs')
      .upsert(row, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  Blog "${item.title}" error:`, error.message);
      continue;
    }

    console.log(`  Blog "${item.title}" -> ${data.id}`);

    // Link blog to tags
    if (Array.isArray(item.tag)) {
      for (const tagName of item.tag) {
        if (tagName === 'all') continue;
        const tagId = tagMap[tagName];
        if (tagId) {
          const { error: linkErr } = await supabase
            .from('blog_tag_map')
            .upsert({ blog_id: data.id, tag_id: tagId });
          if (linkErr) {
            console.error(`    Tag link error:`, linkErr.message);
          }
        }
      }
    }
  }

  console.log(`Migrated ${items.length} blogs.\n`);
}

async function main() {
  console.log('Starting data migration...\n');
  await migrateProducts();
  await migrateBlogs();
  console.log('Migration complete!');
}

main().catch(console.error);
