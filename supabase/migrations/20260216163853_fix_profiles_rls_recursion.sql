-- ============================================================
-- Fix: infinite recursion in profiles RLS policies
--
-- Problem: "Admin can view/update all profiles" policies query
-- the profiles table itself, triggering RLS evaluation again
-- → infinite recursion.
--
-- Solution: Create a SECURITY DEFINER function is_admin()
-- that bypasses RLS, then use it in all admin policies.
-- ============================================================

-- 1. Create helper function (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Drop the recursive policies on profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- 3. Recreate them using is_admin()
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 4. Also fix other tables that reference profiles directly
-- (these work but are better with the function for consistency)

-- categories
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- products
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- product_categories
DROP POLICY IF EXISTS "Admin can manage product_categories" ON public.product_categories;
CREATE POLICY "Admin can manage product_categories"
  ON public.product_categories FOR ALL
  USING (public.is_admin());

-- blog_categories
DROP POLICY IF EXISTS "Admin can manage blog_categories" ON public.blog_categories;
CREATE POLICY "Admin can manage blog_categories"
  ON public.blog_categories FOR ALL
  USING (public.is_admin());

-- blog_tags
DROP POLICY IF EXISTS "Admin can manage blog_tags" ON public.blog_tags;
CREATE POLICY "Admin can manage blog_tags"
  ON public.blog_tags FOR ALL
  USING (public.is_admin());

-- blogs
DROP POLICY IF EXISTS "Admin can manage blogs" ON public.blogs;
CREATE POLICY "Admin can manage blogs"
  ON public.blogs FOR ALL
  USING (public.is_admin());

-- blog_tag_map
DROP POLICY IF EXISTS "Admin can manage blog_tag_map" ON public.blog_tag_map;
CREATE POLICY "Admin can manage blog_tag_map"
  ON public.blog_tag_map FOR ALL
  USING (public.is_admin());
