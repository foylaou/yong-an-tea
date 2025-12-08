-- Storage Buckets 配置
-- 創建存儲桶並設置安全策略

-- ============================================
-- 1. Product Images Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 公開讀取
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 管理員可以上傳
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- 管理員可以更新
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images'
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- 管理員可以刪除
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images'
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- ============================================
-- 2. Category Images Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'category-images',
    'category-images',
    true,
    3145728, -- 3MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 公開讀取
CREATE POLICY "Public read access for category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

-- 管理員可以管理
CREATE POLICY "Admins can manage category images"
ON storage.objects FOR ALL
USING (
    bucket_id = 'category-images'
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- ============================================
-- 3. User Avatars Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-avatars',
    'user-avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- 公開讀取
CREATE POLICY "Public read access for user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- 用戶可以上傳自己的頭像
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 用戶可以更新自己的頭像
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 用戶可以刪除自己的頭像
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 4. Blog Images Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-images',
    'blog-images',
    true,
    5242880, -- 5MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 公開讀取
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- 管理員和編輯可以管理
CREATE POLICY "Admins can manage blog images"
ON storage.objects FOR ALL
USING (
    bucket_id = 'blog-images'
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- ============================================
-- 5. Assets Bucket (公共資源)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets',
    'assets',
    true,
    10485760, -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- 公開讀取
CREATE POLICY "Public read access for assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- 管理員可以管理
CREATE POLICY "Admins can manage assets"
ON storage.objects FOR ALL
USING (
    bucket_id = 'assets'
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);
