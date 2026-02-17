/**
 * Migration script: Markdown blogs → Supabase
 *
 * Usage: node --env-file=.env.local node_modules/.bin/tsx scripts/migrate-blogs.ts
 *
 * - Reads all .md files from src/data/blogs/
 * - Upserts blog_categories + blog_tags
 * - Upserts into Supabase `blogs` table (by slug)
 * - Creates blog_tag_map associations
 * - Safe to re-run (idempotent via upsert)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BLOGS_DIR = path.join(process.cwd(), 'src/data/blogs');

// -----------------------------------------------------------------------
// Step 0: Ensure blog-images bucket exists
// -----------------------------------------------------------------------
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === 'blog-images');
  if (!exists) {
    const { error } = await supabase.storage.createBucket('blog-images', {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
    if (error) {
      console.error('Error creating blog-images bucket:', error.message);
    } else {
      console.log('Created blog-images bucket');
    }
  } else {
    console.log('blog-images bucket already exists');
  }
}

// -----------------------------------------------------------------------
// Step 1: Collect unique categories and tags from markdown frontmatter
// -----------------------------------------------------------------------
interface BlogFile {
  slug: string;
  fm: Record<string, any>;
  content: string;
}

function readBlogs(): BlogFile[] {
  const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} blog markdown files`);
  return files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(BLOGS_DIR, file), 'utf-8');
    const { data: fm, content } = matter(raw);
    return { slug, fm, content };
  });
}

async function upsertCategories(blogs: BlogFile[]) {
  // Collect unique categoryItem values
  const categoryItems = new Set<string>();
  for (const { fm } of blogs) {
    if (fm.categoryItem) categoryItems.add(fm.categoryItem);
  }

  console.log(`Unique blog categories: ${[...categoryItems].join(', ')}`);

  const categoryMap = new Map<string, string>(); // slug → id

  for (const slug of categoryItems) {
    const name = slug.charAt(0).toUpperCase() + slug.slice(1);
    const { data, error } = await supabase
      .from('blog_categories')
      .upsert({ slug, name }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  [ERROR] category ${slug}: ${error.message}`);
    } else {
      categoryMap.set(slug, data.id);
      console.log(`  [OK] category: ${slug} (${data.id})`);
    }
  }

  return categoryMap;
}

async function upsertTags(blogs: BlogFile[]) {
  // Collect unique tags (exclude "all")
  const tagSlugs = new Set<string>();
  for (const { fm } of blogs) {
    const tags = fm.tag as string[] | undefined;
    if (tags) {
      for (const t of tags) {
        if (t !== 'all') tagSlugs.add(t);
      }
    }
  }

  console.log(`Unique blog tags: ${[...tagSlugs].join(', ')}`);

  const tagMap = new Map<string, string>(); // slug → id

  for (const slug of tagSlugs) {
    const name = slug.charAt(0).toUpperCase() + slug.slice(1);
    const { data, error } = await supabase
      .from('blog_tags')
      .upsert({ slug, name }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  [ERROR] tag ${slug}: ${error.message}`);
    } else {
      tagMap.set(slug, data.id);
      console.log(`  [OK] tag: ${slug} (${data.id})`);
    }
  }

  return tagMap;
}

// -----------------------------------------------------------------------
// Step 2: Upsert blogs and build tag associations
// -----------------------------------------------------------------------
async function upsertBlogs(
  blogs: BlogFile[],
  tagMap: Map<string, string>
) {
  let successCount = 0;
  let errorCount = 0;

  for (const { slug, fm, content } of blogs) {
    const row: Record<string, any> = {
      legacy_id: fm.id ?? null,
      title: fm.title,
      slug,
      medium_image: fm.mediumImage ?? null,
      masonry: fm.masonry ?? null,
      large_image: fm.largeImage ?? null,
      extra_large_image: fm.extraLargeImage ?? null,
      alt_image: fm.altImage ?? null,
      date: fm.date ?? new Date().toISOString().split('T')[0],
      author: fm.author ?? 'Admin',
      category_item: fm.categoryItem ?? null,
      desc_text: fm.desc ?? null,
      blockquote_desc: fm.blockquoteDesc ?? null,
      single_img_one: fm.singleImgOne ?? null,
      single_img_two: fm.singleImgTwo ?? null,
      single_img_alt: fm.singleImgAlt ?? null,
      is_featured: fm.isFeatured ?? false,
      published: true,
      content: content.trim() || null,
    };

    // Upsert by slug
    const { data: blog, error: upsertErr } = await supabase
      .from('blogs')
      .upsert(row, { onConflict: 'slug' })
      .select('id')
      .single();

    if (upsertErr) {
      console.error(`  [ERROR] ${slug}: ${upsertErr.message}`);
      errorCount++;
      continue;
    }

    const blogId = blog.id;

    // Handle tag associations
    const tags = (fm.tag as string[] | undefined) ?? [];
    const validTagIds: string[] = [];
    for (const t of tags) {
      if (t !== 'all' && tagMap.has(t)) {
        validTagIds.push(tagMap.get(t)!);
      }
    }

    // Delete existing tag links, then insert new ones
    await supabase.from('blog_tag_map').delete().eq('blog_id', blogId);

    if (validTagIds.length > 0) {
      const { error: tmErr } = await supabase.from('blog_tag_map').insert(
        validTagIds.map((tid) => ({
          blog_id: blogId,
          tag_id: tid,
        }))
      );
      if (tmErr) {
        console.error(
          `  [WARN] ${slug}: tag links failed — ${tmErr.message}`
        );
      }
    }

    console.log(`  [OK] ${slug} (${fm.title})`);
    successCount++;
  }

  console.log(`\nDone. ${successCount} succeeded, ${errorCount} failed.`);
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------
async function main() {
  await ensureBucket();

  const blogs = readBlogs();

  console.log('\n--- Upserting blog categories ---');
  await upsertCategories(blogs);

  console.log('\n--- Upserting blog tags ---');
  const tagMap = await upsertTags(blogs);

  console.log('\n--- Upserting blogs ---');
  await upsertBlogs(blogs, tagMap);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
