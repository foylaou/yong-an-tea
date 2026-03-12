-- Product images gallery (multiple images per product)
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order int not null default 0,
  sm_url text not null,
  md_url text not null,
  alt_text text default '',
  created_at timestamptz not null default now()
);

alter table public.product_images enable row level security;

create policy "Anyone can view product images"
  on public.product_images for select
  using (true);

create policy "Admin can manage product images"
  on public.product_images for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index idx_product_images_product_id on public.product_images(product_id);
