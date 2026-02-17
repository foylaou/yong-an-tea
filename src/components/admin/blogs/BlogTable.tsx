'use client';

import { useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/admin/common/Pagination';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogTableProps {
  initialBlogs: any[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
  categories: BlogCategory[];
}

type DeleteMode = 'soft' | 'hard';

export default function BlogTable({
  initialBlogs,
  initialTotal,
  initialPage,
  perPage,
  categories,
}: BlogTableProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('soft');
  const [deleting, setDeleting] = useState(false);

  async function fetchBlogs(params: {
    page?: number;
    search?: string;
    category?: string;
    status?: string;
  }) {
    setLoading(true);
    const p = params.page ?? page;
    const s = params.search ?? search;
    const c = params.category ?? categoryFilter;
    const st = params.status ?? statusFilter;

    const qs = new URLSearchParams({
      page: String(p),
      perPage: String(perPage),
      ...(s && { search: s }),
      ...(c && { category: c }),
      ...(st && { status: st }),
    });

    try {
      const res = await fetch(`/api/admin/blogs?${qs}`);
      const data = await res.json();
      setBlogs(data.blogs);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchBlogs({ page: 1, search });
  }

  function openDeleteDialog(blog: any, mode: DeleteMode) {
    setDeleteTarget(blog);
    setDeleteMode(mode);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const url =
        deleteMode === 'hard'
          ? `/api/admin/blogs/${deleteTarget.id}?hard=true`
          : `/api/admin/blogs/${deleteTarget.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (deleteMode === 'hard') {
          setBlogs((prev) => prev.filter((b: any) => b.id !== deleteTarget.id));
          setTotal((prev) => prev - 1);
        } else {
          setBlogs((prev) =>
            prev.map((b: any) =>
              b.id === deleteTarget.id ? { ...b, published: false } : b
            )
          );
        }
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function getTagNames(blog: any): string {
    return (
      blog.blog_tag_map
        ?.map((tm: any) => tm.blog_tags?.name)
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
            placeholder="搜尋文章標題或作者..."
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
            fetchBlogs({ page: 1, category: e.target.value });
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全部分類</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchBlogs({ page: 1, status: e.target.value });
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">全部狀態</option>
          <option value="published">已發布</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  文章標題
                </th>
                <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  分類
                </th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  作者
                </th>
                <th className="w-[110px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  日期
                </th>
                <th className="w-[80px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  狀態
                </th>
                <th className="w-[160px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    載入中...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    沒有找到文章
                  </td>
                </tr>
              ) : (
                blogs.map((blog: any) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {blog.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {getTagNames(blog)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {blog.category_item || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {blog.author}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {blog.date}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          blog.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {blog.published ? '已發布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                        >
                          編輯
                        </Link>
                        {blog.published && (
                          <button
                            onClick={() => openDeleteDialog(blog, 'soft')}
                            className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-100"
                          >
                            取消發布
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteDialog(blog, 'hard')}
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
            fetchBlogs({ page: p });
          }}
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteMode === 'hard' ? '永久刪除文章' : '取消發布文章'}
        message={
          deleteMode === 'hard'
            ? `確定要永久刪除「${deleteTarget?.title}」嗎？此操作無法復原！`
            : `確定要取消發布「${deleteTarget?.title}」嗎？文章將變為草稿狀態。`
        }
        confirmLabel={deleteMode === 'hard' ? '永久刪除' : '確認取消發布'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
