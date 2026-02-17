'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductTableProps {
  initialProducts: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
  categories: Category[];
}

function getImageUrl(value: string | null | undefined, slug: string): string {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `/images/products/${slug}/${value}`;
}

type DeleteMode = 'soft' | 'hard';

export default function ProductTable({
  initialProducts,
  initialTotal,
  initialPage,
  perPage,
  categories,
}: ProductTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('soft');
  const [deleting, setDeleting] = useState(false);

  async function fetchProducts(params: {
    page?: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const c = params.categoryId ?? categoryFilter;
    const st = params.status ?? statusFilter;

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      ...(s && { search: s }),
      ...(c && { categoryId: c }),
      ...(st && { status: st }),
    });

    try {
      const res = await fetch(`/api/admin/products?${qs}`);
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProducts({ page: 1, search });
  }

  function openDeleteDialog(product: any, mode: DeleteMode) {
    setDeleteTarget(product);
    setDeleteMode(mode);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const url = deleteMode === 'hard'
        ? `/api/admin/products/${deleteTarget.id}?hard=true`
        : `/api/admin/products/${deleteTarget.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (deleteMode === 'hard') {
          setProducts((prev) => prev.filter((p: any) => p.id !== deleteTarget.id));
          setTotal((prev) => prev - 1);
        } else {
          setProducts((prev) =>
            prev.map((p: any) =>
              p.id === deleteTarget.id ? { ...p, is_active: false } : p
            )
          );
        }
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function getCategoryNames(product: any): string {
    return (
      product.product_categories
        ?.map((pc: any) => pc.categories?.name)
        .filter(Boolean)
        .join(', ') || '-'
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋商品名稱或 SKU..."
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            搜尋
          </button>
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            fetchProducts({ page: 1, categoryId: e.target.value });
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全部分類</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchProducts({ page: 1, status: e.target.value });
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全部狀態</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[60px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">縮圖</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">商品名稱</th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">SKU</th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">價格</th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">分類</th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">狀態</th>
                <th className="w-[160px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    載入中...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    沒有找到商品
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {product.xs_image ? (
                        <img
                          src={getImageUrl(product.xs_image, product.slug)}
                          alt={product.alt_image || product.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sku || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {product.discount_price ? (
                        <span>
                          <span className="text-red-600">${product.discount_price}</span>{' '}
                          <span className="text-xs text-gray-400 line-through">${product.price}</span>
                        </span>
                      ) : (
                        <span className="text-gray-900">${product.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getCategoryNames(product)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? '上架' : '下架'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                        >
                          編輯
                        </Link>
                        {product.is_active && (
                          <button
                            onClick={() => openDeleteDialog(product, 'soft')}
                            className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-100"
                          >
                            下架
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteDialog(product, 'hard')}
                          className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={total}
          perPage={perPage}
          onPageChange={(p) => {
            setPage(p);
            fetchProducts({ page: p });
          }}
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteMode === 'hard' ? '永久刪除商品' : '下架商品'}
        message={
          deleteMode === 'hard'
            ? `確定要永久刪除「${deleteTarget?.title}」嗎？此操作無法復原！`
            : `確定要下架「${deleteTarget?.title}」嗎？此操作會將商品設為不可見，但不會永久刪除。`
        }
        confirmLabel={deleteMode === 'hard' ? '永久刪除' : '確認下架'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
