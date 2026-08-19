'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
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
import CachedImage from '@/components/CachedImage';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import { useEditDialog } from '@/hooks/useEditDialog';
import type { AdminProduct } from '@/types/admin-product';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface ProductsTableProps {
    initialProducts: AdminProduct[];
    initialTotal: number;
    initialPage: number;
    perPage: number;
    categories: Category[];
}

function getImageUrl(value: string | null | undefined): string {
    return value || '';
}

type DeleteMode = 'soft' | 'hard';
type SortMode = 'custom' | 'newest' | 'oldest' | 'sales';

// ---------------------------------------------------------------------------
// Sortable DnD item (custom product sort)
// ---------------------------------------------------------------------------
function SortableProductRow({ product }: { product: AdminProduct }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: product.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border-base-300 bg-base-100 flex items-center gap-3 rounded-box border px-3 py-2"
        >
            <button
                type="button"
                className="cursor-grab touch-none text-base-content/40 hover:text-base-content"
                {...attributes}
                {...listeners}
            >
                <span className="iconify lucide--grip-vertical size-4.5" />
            </button>
            {product.xs_image ? (
                <CachedImage
                    src={getImageUrl(product.xs_image)}
                    alt={product.title}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded object-cover"
                />
            ) : (
                <div className="bg-base-200 text-base-content/40 flex h-8 w-8 items-center justify-center rounded text-xs">
                    N/A
                </div>
            )}
            <span className="flex-1 truncate text-sm font-medium">
                {product.title}
            </span>
            <span className="text-base-content/40 text-xs">
                #{product.sort_order ?? 0}
            </span>
        </div>
    );
}

function DndSortForm({
    initialData,
    onConfirm,
    onCancel,
}: {
    initialData?: AdminProduct[];
    onConfirm: (data: AdminProduct[]) => void;
    onCancel: () => void;
}) {
    const [items, setItems] = useState<AdminProduct[]>(initialData || []);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

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
            <p className="text-base-content/60 mb-3 text-sm">
                拖曳商品以調整排序，排在上方的商品會優先顯示。
            </p>
            <div className="max-h-[50vh] space-y-1 overflow-y-auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((product) => (
                            <SortableProductRow
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
            <div className="mt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-sm btn-outline"
                >
                    取消
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(items)}
                    className="btn btn-sm btn-primary"
                >
                    儲存排序
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Bestseller settings dialog
// ---------------------------------------------------------------------------
function SortableBestsellerRow({
    product,
    onRemove,
}: {
    product: AdminProduct;
    onRemove: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: product.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border-base-300 bg-base-100 flex items-center gap-3 rounded-box border px-3 py-2"
        >
            <button
                type="button"
                className="cursor-grab touch-none text-base-content/40 hover:text-base-content"
                {...attributes}
                {...listeners}
            >
                <span className="iconify lucide--grip-vertical size-4.5" />
            </button>
            {product.xs_image ? (
                <CachedImage
                    src={getImageUrl(product.xs_image)}
                    alt={product.title}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded object-cover"
                />
            ) : (
                <div className="bg-base-200 text-base-content/40 flex h-8 w-8 items-center justify-center rounded text-xs">
                    N/A
                </div>
            )}
            <span className="flex-1 truncate text-sm font-medium">
                {product.title}
            </span>
            <button
                type="button"
                onClick={() => onRemove(product.id)}
                className="text-base-content/40 hover:text-error"
            >
                <span className="iconify lucide--x size-4" />
            </button>
        </div>
    );
}

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
    allProducts: AdminProduct[];
    onConfirm: (data: BestsellerFormData) => void;
    onCancel: () => void;
}) {
    const [mode, setMode] = useState<'auto' | 'custom'>(initialData.mode);
    const [selectedProducts, setSelectedProducts] = useState<AdminProduct[]>(
        () => {
            const byId = new Map(allProducts.map((p) => [p.id, p]));
            return initialData.productIds
                .map((id) => byId.get(id))
                .filter((p): p is AdminProduct => Boolean(p));
        }
    );
    const [addValue, setAddValue] = useState('');
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

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
            <fieldset className="fieldset mb-2">
                <legend className="fieldset-legend">顯示模式</legend>
                <select
                    value={mode}
                    onChange={(e) =>
                        setMode(e.target.value as 'auto' | 'custom')
                    }
                    className="select w-full"
                >
                    <option value="auto">自動（依銷量排序）</option>
                    <option value="custom">自訂（拖曳排序）</option>
                </select>
            </fieldset>

            {mode === 'custom' && (
                <>
                    <fieldset className="fieldset mb-1">
                        <legend className="fieldset-legend">新增商品</legend>
                        <select
                            value={addValue}
                            onChange={(e) => handleAdd(e.target.value)}
                            className="select w-full"
                        >
                            <option value="">選擇商品...</option>
                            {availableProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <p className="text-base-content/60 mb-2 text-sm">
                        拖曳調整順序，點擊 X
                        移除。前台首頁將依此順序顯示暢銷商品。
                    </p>
                    <div className="max-h-[40vh] space-y-1 overflow-y-auto">
                        {selectedProducts.length === 0 ? (
                            <p className="text-base-content/40 py-4 text-center text-sm">
                                尚未選擇商品
                            </p>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={selectedProducts.map((p) => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {selectedProducts.map((product) => (
                                        <SortableBestsellerRow
                                            key={product.id}
                                            product={product}
                                            onRemove={handleRemove}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </>
            )}

            {mode === 'auto' && (
                <p className="text-base-content/60 text-sm">
                    系統將根據訂單銷量自動顯示最暢銷的商品。
                </p>
            )}

            <div className="mt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-sm btn-outline"
                >
                    取消
                </button>
                <button
                    type="button"
                    onClick={() =>
                        onConfirm({
                            mode,
                            productIds: selectedProducts.map((p) => p.id),
                        })
                    }
                    className="btn btn-sm btn-primary"
                >
                    儲存
                </button>
            </div>
        </div>
    );
}

function CategoryBadges({ product }: { product: AdminProduct }) {
    const cats = product.product_categories
        ?.map((pc) => pc.categories?.name)
        .filter(Boolean) as string[] | undefined;
    if (!cats?.length) return <span className="text-base-content/30">-</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {cats.map((name) => (
                <span key={name} className="badge badge-info badge-sm">
                    {name}
                </span>
            ))}
        </div>
    );
}

const columnHelper = createColumnHelper<AdminProduct>();

export function ProductsTable({
    initialProducts,
    initialTotal,
    initialPage,
    perPage,
    categories,
}: ProductsTableProps) {
    const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(initialPage);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('custom');
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
    const [deleteMode, setDeleteMode] = useState<DeleteMode>('soft');
    const [deleting, setDeleting] = useState(false);

    const { editDialog, EditComponent } = useEditDialog<AdminProduct[]>();
    const {
        editDialog: bestsellerDialog,
        EditComponent: BestsellerEditComponent,
    } = useEditDialog<BestsellerFormData>();

    async function handleBestsellerSetting() {
        const [settingsRes, productsRes] = await Promise.all([
            fetch('/api/admin/settings?group=bestseller'),
            fetch(
                '/api/admin/products?page=1&perPage=999&sortBy=custom&status=active'
            ),
        ]);
        const settingsData = await settingsRes.json();
        const productsData = await productsRes.json();

        const bsSettings = settingsData.settings?.bestseller || {};
        let currentIds: string[] = [];
        try {
            currentIds = JSON.parse(bsSettings.bestseller_product_ids || '[]');
        } catch {
            /* ignore */
        }

        const result = await bestsellerDialog({
            cardTitle: '暢銷商品設定',
            cardStyle:
                'rounded-box bg-base-100 border border-base-300 shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto',
            renderForm: ({ onConfirm, onCancel }) => (
                <BestsellerForm
                    initialData={{
                        mode:
                            (bsSettings.bestseller_mode as 'auto' | 'custom') ||
                            'auto',
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
                        bestseller_product_ids: JSON.stringify(
                            result.productIds
                        ),
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

    function openDeleteDialog(product: AdminProduct, mode: DeleteMode) {
        setDeleteTarget(product);
        setDeleteMode(mode);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const url =
                deleteMode === 'hard'
                    ? `/api/admin/products/${deleteTarget.id}?hard=true`
                    : `/api/admin/products/${deleteTarget.id}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                if (deleteMode === 'hard') {
                    setProducts((prev) =>
                        prev.filter((p) => p.id !== deleteTarget.id)
                    );
                    setTotal((prev) => prev - 1);
                } else {
                    setProducts((prev) =>
                        prev.map((p) =>
                            p.id === deleteTarget.id
                                ? { ...p, is_active: false }
                                : p
                        )
                    );
                }
            }
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }

    async function handleActivate(product: AdminProduct) {
        const res = await fetch(`/api/admin/products/${product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: true }),
        });
        if (res.ok) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === product.id ? { ...p, is_active: true } : p
                )
            );
        }
    }

    async function handleSortChange(mode: SortMode) {
        setSortMode(mode);

        if (mode === 'custom') {
            const res = await fetch(
                '/api/admin/products?page=1&perPage=999&sortBy=custom'
            );
            const data = await res.json();
            const allProducts: AdminProduct[] = data.products || [];

            const result = await editDialog({
                cardTitle: '自訂商品排序',
                cardStyle:
                    'rounded-box bg-base-100 border border-base-300 shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto',
                renderForm: ({ onConfirm, onCancel }) => (
                    <DndSortForm
                        initialData={allProducts}
                        onConfirm={onConfirm}
                        onCancel={onCancel}
                    />
                ),
            });

            if (result) {
                const items = result.map((p, idx) => ({
                    id: p.id,
                    sort_order: idx,
                }));
                await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items }),
                });
                fetchProducts({ sortBy: 'custom' });
            }
        } else {
            fetchProducts({ page: 1, sortBy: mode });
        }
    }

    const columns = useMemo<ColumnDef<AdminProduct, any>[]>(
        () => [
            columnHelper.display({
                id: 'thumb',
                header: '縮圖',
                cell: ({ row }) =>
                    row.original.xs_image ? (
                        <CachedImage
                            src={getImageUrl(row.original.xs_image)}
                            alt={row.original.alt_image || row.original.title}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded object-cover"
                        />
                    ) : (
                        <div className="bg-base-200 text-base-content/40 flex h-10 w-10 items-center justify-center rounded text-xs">
                            N/A
                        </div>
                    ),
            }),
            columnHelper.accessor('title', {
                header: '商品名稱',
                cell: ({ row }) => (
                    <Link
                        href={`/admin/products/${row.original.id}/edit`}
                        className="link link-hover font-medium"
                    >
                        {row.original.title}
                    </Link>
                ),
            }),
            columnHelper.accessor('sku', {
                header: 'SKU',
                cell: ({ getValue }) => getValue() || '-',
            }),
            columnHelper.display({
                id: 'price',
                header: '價格',
                cell: ({ row }) =>
                    row.original.discount_price ? (
                        <span>
                            <span className="text-error">
                                ${row.original.discount_price}
                            </span>{' '}
                            <span className="text-base-content/40 text-xs line-through">
                                ${row.original.price}
                            </span>
                        </span>
                    ) : (
                        <span>${row.original.price}</span>
                    ),
            }),
            columnHelper.display({
                id: 'categories',
                header: '分類',
                cell: ({ row }) => <CategoryBadges product={row.original} />,
            }),
            columnHelper.display({
                id: 'status',
                header: '狀態',
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        <span
                            className={`badge badge-sm ${row.original.is_active ? 'badge-success' : 'badge-ghost'}`}
                        >
                            {row.original.is_active ? '上架' : '下架'}
                        </span>
                        {row.original.is_hidden && (
                            <span className="badge badge-sm badge-warning">
                                隱藏
                            </span>
                        )}
                    </div>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: '操作',
                cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <div className="flex gap-2">
                            <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="btn btn-xs btn-outline btn-info"
                            >
                                編輯
                            </Link>
                            {product.is_active ? (
                                <button
                                    onClick={() =>
                                        openDeleteDialog(product, 'soft')
                                    }
                                    className="btn btn-xs btn-outline btn-warning"
                                >
                                    下架
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleActivate(product)}
                                    className="btn btn-xs btn-outline btn-success"
                                >
                                    上架
                                </button>
                            )}
                            <button
                                onClick={() =>
                                    openDeleteDialog(product, 'hard')
                                }
                                className="btn btn-xs btn-outline btn-error"
                            >
                                刪除
                            </button>
                        </div>
                    );
                },
            }),
        ],
        []
    );

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <div>
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleBestsellerSetting}
                    className="btn btn-sm btn-warning"
                >
                    暢銷商品設定
                </button>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="搜尋商品名稱或 SKU..."
                        className="input input-sm w-56"
                    />
                    <button type="submit" className="btn btn-sm btn-outline">
                        搜尋
                    </button>
                </form>
                <select
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        fetchProducts({ page: 1, categoryId: e.target.value });
                    }}
                    className="select select-sm"
                >
                    <option value="">全部分類</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        fetchProducts({ page: 1, status: e.target.value });
                    }}
                    className="select select-sm"
                >
                    <option value="">全部狀態</option>
                    <option value="active">上架</option>
                    <option value="inactive">下架</option>
                    <option value="hidden">隱藏商品</option>
                </select>
                <select
                    value={sortMode}
                    onChange={(e) =>
                        handleSortChange(e.target.value as SortMode)
                    }
                    className="select select-sm"
                >
                    <option value="custom">排序：自訂</option>
                    <option value="newest">排序：新到舊</option>
                    <option value="oldest">排序：舊到新</option>
                    <option value="sales">排序：銷量</option>
                </select>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
                <table className="table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-base-content/40 py-8 text-center"
                                >
                                    載入中...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-base-content/40 py-8 text-center"
                                >
                                    沒有找到商品
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile / tablet card list */}
            <div className="space-y-3 md:hidden">
                {loading ? (
                    <div className="text-base-content/40 py-8 text-center">
                        載入中...
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-base-content/40 py-8 text-center">
                        沒有找到商品
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="card card-border">
                            <div className="card-body gap-2 p-4">
                                <div className="flex items-start gap-3">
                                    {product.xs_image ? (
                                        <CachedImage
                                            src={getImageUrl(product.xs_image)}
                                            alt={
                                                product.alt_image ||
                                                product.title
                                            }
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 shrink-0 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="bg-base-200 text-base-content/40 flex h-12 w-12 shrink-0 items-center justify-center rounded text-xs">
                                            N/A
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className="link link-hover font-medium"
                                        >
                                            {product.title}
                                        </Link>
                                        <div className="text-base-content/50 text-xs">
                                            SKU: {product.sku || '-'}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            {product.discount_price ? (
                                                <>
                                                    <span className="text-error text-sm">
                                                        $
                                                        {product.discount_price}
                                                    </span>
                                                    <span className="text-base-content/40 text-xs line-through">
                                                        ${product.price}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-sm">
                                                    ${product.price}
                                                </span>
                                            )}
                                            <span
                                                className={`badge badge-xs ${product.is_active ? 'badge-success' : 'badge-ghost'}`}
                                            >
                                                {product.is_active
                                                    ? '上架'
                                                    : '下架'}
                                            </span>
                                            {product.is_hidden && (
                                                <span className="badge badge-xs badge-warning">
                                                    隱藏
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <CategoryBadges product={product} />
                                <div className="card-actions justify-end">
                                    <Link
                                        href={`/admin/products/${product.id}/edit`}
                                        className="btn btn-xs btn-outline btn-info"
                                    >
                                        編輯
                                    </Link>
                                    {product.is_active ? (
                                        <button
                                            onClick={() =>
                                                openDeleteDialog(
                                                    product,
                                                    'soft'
                                                )
                                            }
                                            className="btn btn-xs btn-outline btn-warning"
                                        >
                                            下架
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleActivate(product)
                                            }
                                            className="btn btn-xs btn-outline btn-success"
                                        >
                                            上架
                                        </button>
                                    )}
                                    <button
                                        onClick={() =>
                                            openDeleteDialog(product, 'hard')
                                        }
                                        className="btn btn-xs btn-outline btn-error"
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Pagination
                page={page}
                total={total}
                perPage={perPage}
                onPageChange={(p) => fetchProducts({ page: p })}
            />

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
