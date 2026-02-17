-- ============================================================
-- Phase 1: Core Schema for Helendo E-commerce
-- ============================================================

-- gen_random_uuid() is built-in to PostgreSQL 13+ (used by Supabase)

-- ============================================================
-- 1. Profiles (linked to auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admin can view all profiles
create policy "Admin can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can update all profiles
create policy "Admin can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 2. Categories (products)
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Anyone can view active categories"
  on public.categories for select
  using (is_active = true);

create policy "Admin can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 3. Products
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null,
  slug text not null unique,
  xs_image text,
  sm_image text,
  md_image text,
  home_collection_img text,
  alt_image text,
  price numeric(10,2) not null default 0,
  discount_price numeric(10,2),
  desc_text text,
  sku int,
  availability text default 'in-stock',
  size text,
  color text,
  tag text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sold_out_sticker text,
  best_seller_sticker text,
  offer_sticker text,
  content text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy "Admin can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 4. Product ↔ Category (M:N)
-- ============================================================
create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

alter table public.product_categories enable row level security;

create policy "Anyone can view product_categories"
  on public.product_categories for select
  using (true);

create policy "Admin can manage product_categories"
  on public.product_categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 5. Blog Categories
-- ============================================================
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_categories enable row level security;

create policy "Anyone can view active blog_categories"
  on public.blog_categories for select
  using (is_active = true);

create policy "Admin can manage blog_categories"
  on public.blog_categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 6. Blog Tags
-- ============================================================
create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.blog_tags enable row level security;

create policy "Anyone can view blog_tags"
  on public.blog_tags for select
  using (true);

create policy "Admin can manage blog_tags"
  on public.blog_tags for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 7. Blogs
-- ============================================================
create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null,
  slug text not null unique,
  medium_image text,
  masonry text,
  large_image text,
  extra_large_image text,
  alt_image text,
  date date,
  author text,
  category_item text,
  desc_text text,
  blockquote_desc text,
  single_img_one text,
  single_img_two text,
  single_img_alt text,
  content text,
  is_featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs enable row level security;

create policy "Anyone can view published blogs"
  on public.blogs for select
  using (published = true);

create policy "Admin can manage blogs"
  on public.blogs for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 8. Blog ↔ Tag (M:N)
-- ============================================================
create table public.blog_tag_map (
  blog_id uuid not null references public.blogs(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (blog_id, tag_id)
);

alter table public.blog_tag_map enable row level security;

create policy "Anyone can view blog_tag_map"
  on public.blog_tag_map for select
  using (true);

create policy "Admin can manage blog_tag_map"
  on public.blog_tag_map for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at column
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_categories_updated_at
  before update on public.categories
  for each row execute function public.update_updated_at_column();

create trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at_column();

create trigger update_blog_categories_updated_at
  before update on public.blog_categories
  for each row execute function public.update_updated_at_column();

create trigger update_blogs_updated_at
  before update on public.blogs
  for each row execute function public.update_updated_at_column();
