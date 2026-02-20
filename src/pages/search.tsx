'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import FooterComps from '../components/FooterComps';
import { formatPrice } from '../store/settings/settings-slice';

interface SearchProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  image: string;
  availability: string;
  stockQty: number;
}

export default function SearchPage() {
  const router = useRouter();
  const q = (router.query.q as string) || '';
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setSearched(true);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <HeaderOne headerContainer="container" />
      <Breadcrumb
        breadcrumbContainer="container"
        title={q ? `搜尋「${q}」` : '搜尋'}
        item="首頁"
        itemPath="/"
        activeItem="搜尋"
      />

      <div className="container py-[80px]">
        {loading ? (
          <p className="text-center text-gray-400 py-16">搜尋中...</p>
        ) : !searched ? (
          <p className="text-center text-gray-400 py-16">
            請在上方搜尋列輸入關鍵字
          </p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">
              找不到與「{q}」相關的商品
            </p>
            <p className="text-gray-400 text-sm mb-6">
              請嘗試其他關鍵字，或瀏覽我們的商品分類
            </p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-6 py-2.5 text-sm hover:bg-gray-800 transition-colors"
            >
              瀏覽所有商品
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-8">
              找到 {products.length} 項商品
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        無圖片
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="mt-1 text-sm">
                    {product.discountPrice ? (
                      <>
                        <span className="text-red-600 font-medium">
                          {formatPrice(product.discountPrice)}
                        </span>
                        <span className="text-gray-400 line-through ml-2">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  {product.availability === 'out-of-stock' && (
                    <span className="text-xs text-red-500 mt-1 inline-block">
                      已售完
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <FooterComps footerContainer="container" />
    </>
  );
}
