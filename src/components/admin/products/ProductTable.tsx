'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import { useEditDialog } from '@/hooks/useEditDialog';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
type SortMode = 'custom' | 'newest' | 'oldest' | 'sales';

// ---------------------------------------------------------------------------
// Sortable DnD item
// ---------------------------------------------------------------------------
function SortableProductRow({ product }: { product: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded border border-gray-200 bg-white px-3 py-2"
    >
      <button type="button" className="cursor-grab touch-none text-gray-400 hover:text-gray-600" {...attributes} {...listeners}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      {product.xs_image ? (
        <img
          src={getImageUrl(product.xs_image, product.slug)}
          alt={product.title}
          className="h-8 w-8 rounded object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-xs text-gray-400">N/A</div>
      )}
      <span className="flex-1 text-sm font-medium text-gray-900 truncate">{product.title}</span>
      <span className="text-xs text-gray-400">#{product.sort_order ?? 0}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DnD Sort Form (used inside useEditDialog)
// ---------------------------------------------------------------------------
function DndSortForm({
  initialData,
  onConfirm,
  onCancel,
}: {
  initialData?: any[];
  onConfirm: (data: any[]) => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<any[]>(initialData || []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">拖曳商品以調整排序，排在上方的商品會優先顯示。</p>
      <div className="max-h-[50vh] overflow-y-auto space-y-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {items.map((product) => (
              <SortableProductRow key={product.id} product={product} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="button"
          onClick={() => onConfirm(items)}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          儲存排序
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable DnD item (with optional remove button)
// ---------------------------------------------------------------------------
function SortableBestsellerRow({
  product,
  onRemove,
}: {
  product: any;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded border border-gray-200 bg-white px-3 py-2"
    >
      <button type="button" className="cursor-grab touch-none text-gray-400 hover:text-gray-600" {...attributes} {...listeners}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      {product.xs_image ? (
        <img
          src={getImageUrl(product.xs_image, product.slug)}
          alt={product.title}
          className="h-8 w-8 rounded object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-xs text-gray-400">N/A</div>
      )}
      <span className="flex-1 text-sm font-medium text-gray-900 truncate">{product.title}</span>
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="text-gray-400 hover:text-red-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bestseller Form (used inside useEditDialog)
// ---------------------------------------------------------------------------
interface BestsellerFormData {
  mode: 'auto' | 'custom';
  productIds: string[];
}

function BestsellerForm({
  initialData,
  allProducts,
  onConfirm,
  onCancel,
}: {
  initialData: BestsellerFormData;
  allProducts: any[];
  onConfirm: (data: BestsellerFormData) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<'auto' | 'custom'>(initialData.mode);
  const [selectedProducts, setSelectedProducts] = useState<any[]>(() => {
    // Resolve initial product IDs to full product objects
    const byId = new Map(allProducts.map((p) => [p.id, p]));
    return initialData.productIds
      .map((id) => byId.get(id))
      .filter(Boolean);
  });
  const [addValue, setAddValue] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const selectedIds = new Set(selectedProducts.map((p) => p.id));
  const availableProducts = allProducts.filter((p) => !selectedIds.has(p.id));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSelectedProducts((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleAdd(productId: string) {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      setSelectedProducts((prev) => [...prev, product]);
      setAddValue('');
    }
  }

  function handleRemove(productId: string) {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  return (
    <div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">顯示模式</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'auto' | 'custom')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="auto">自動（依銷量排序）</option>
          <option value="custom">自訂（拖曳排序）</option>
        </select>
      </div>

      {mode === 'custom' && (
        <>
          {/* Add product dropdown */}
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">新增商品</label>
            <select
              value={addValue}
              onChange={(e) => handleAdd(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">選擇商品...</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* DnD list of selected products */}
          <p className="mb-2 text-sm text-gray-500">
            拖曳調整順序，點擊 X 移除。前台首頁將依此順序顯示暢銷商品。
          </p>
          <div className="max-h-[40vh] overflow-y-auto space-y-1">
            {selectedProducts.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">尚未選擇商品</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selectedProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  {selectedProducts.map((product) => (
                    <SortableBestsellerRow key={product.id} product={product} onRemove={handleRemove} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </>
      )}

      {mode === 'auto' && (
        <p className="text-sm text-gray-500">系統將根據訂單銷量自動顯示最暢銷的商品。</p>
      )}

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="button"
          onClick={() => onConfirm({ mode, productIds: selectedProducts.map((p) => p.id) })}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          儲存
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category badges
// ---------------------------------------------------------------------------
function CategoryBadges({ product }: { product: any }) {
  const cats = product.product_categories
    ?.map((pc: any) => pc.categories?.name)
    .filter(Boolean) as string[] | undefined;

  if (!cats?.length) return <span className="text-gray-400">-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {cats.map((name, i) => (
        <span
          key={i}
          className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ProductTable
// ---------------------------------------------------------------------------
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
  const [sortMode, setSortMode] = useState<SortMode>('custom');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('soft');
  const [deleting, setDeleting] = useState(false);

  const { editDialog, EditComponent } = useEditDialog<any[]>();
  const { editDialog: bestsellerDialog, EditComponent: BestsellerEditComponent } = useEditDialog<BestsellerFormData>();

  async function handleBestsellerSetting() {
    // Fetch current settings + all active products in parallel
    const [settingsRes, productsRes] = await Promise.all([
      fetch('/api/admin/settings?group=bestseller'),
      fetch('/api/admin/products?page=1&perPage=999&sortBy=custom&status=active'),
    ]);
    const settingsData = await settingsRes.json();
    const productsData = await productsRes.json();

    const bsSettings = settingsData.settings?.bestseller || {};
    let currentIds: string[] = [];
    try { currentIds = JSON.parse(bsSettings.bestseller_product_ids || '[]'); } catch { /* ignore */ }

    const result = await bestsellerDialog({
      cardTitle: '暢銷商品設定',
      cardStyle: 'rounded-lg bg-white border border-gray-200 shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto',
      renderForm: ({ onConfirm, onCancel }) => (
        <BestsellerForm
          initialData={{
            mode: (bsSettings.bestseller_mode as 'auto' | 'custom') || 'auto',
            productIds: currentIds,
          }}
          allProducts={productsData.products || []}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ),
    });

    if (result) {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'bestseller',
          settings: {
            bestseller_mode: result.mode,
            bestseller_product_ids: JSON.stringify(result.productIds),
          },
        }),
      });
    }
  }

  async function fetchProducts(params: {
    page?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    sortBy?: SortMode;
  }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const c = params.categoryId ?? categoryFilter;
    const st = params.status ?? statusFilter;
    const sb = params.sortBy ?? sortMode;

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      sortBy: sb,
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

  async function handleActivate(product: any) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p: any) =>
          p.id === product.id ? { ...p, is_active: true } : p
        )
      );
    }
  }

  async function handleSortChange(mode: SortMode) {
    setSortMode(mode);

    if (mode === 'custom') {
      // Fetch ALL products for DnD (no pagination, no filters)
      const res = await fetch('/api/admin/products?page=1&perPage=999&sortBy=custom');
      const data = await res.json();
      const allProducts = data.products || [];

      const result = await editDialog({
        cardTitle: '自訂商品排序',
        cardStyle: 'rounded-lg bg-white border border-gray-200 shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto',
        renderForm: ({ onConfirm, onCancel }) => (
          <DndSortForm
            initialData={allProducts}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        ),
      });

      if (result) {
        // Save sort_order to server
        const items = result.map((p: any, idx: number) => ({ id: p.id, sort_order: idx }));
        await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
        // Refresh current view
        fetchProducts({ sortBy: 'custom' });
      }
    } else {
      fetchProducts({ page: 1, sortBy: mode });
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleBestsellerSetting}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
        >
          暢銷商品設定
        </button>
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
        <select
          value={sortMode}
          onChange={(e) => handleSortChange(e.target.value as SortMode)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="custom">排序：自訂</option>
          <option value="newest">排序：新到舊</option>
          <option value="oldest">排序：舊到新</option>
          <option value="sales">排序：銷量</option>
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
                <th className="w-[160px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">分類</th>
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
                    <td className="px-4 py-3">
                      <CategoryBadges product={product} />
                    </td>
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
                        {product.is_active ? (
                          <button
                            onClick={() => openDeleteDialog(product, 'soft')}
                            className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-100"
                          >
                            下架
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(product)}
                            className="rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100"
                          >
                            上架
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

      {EditComponent}
      {BestsellerEditComponent}
    </div>
  );
}
