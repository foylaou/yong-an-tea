'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/admin/nexus-layout/Pagination';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import { BlogSubNav } from './BlogSubNav';

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

export function BlogTable({ initialBlogs, initialTotal, initialPage, perPage, categories }: BlogTableProps) {
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

  async function fetchBlogs(params: { page?: number; search?: string; category?: string; status?: string }) {
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
      const url = deleteMode === 'hard' ? `/api/admin/blogs/${deleteTarget.id}?hard=true` : `/api/admin/blogs/${deleteTarget.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (deleteMode === 'hard') {
          setBlogs((prev) => prev.filter((b: any) => b.id !== deleteTarget.id));
          setTotal((prev) => prev - 1);
        } else {
          setBlogs((prev) => prev.map((b: any) => (b.id === deleteTarget.id ? { ...b, published: false } : b)));
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

  function BlogActions({ blog }: { blog: any }) {
    return (
      <div className="flex gap-2">
        <Link href={`/admin/blogs/${blog.id}/edit`} className="btn btn-xs btn-outline btn-info">
          編輯
        </Link>
        {blog.published && (
          <button onClick={() => openDeleteDialog(blog, 'soft')} className="btn btn-xs btn-outline btn-warning">
            取消發布
          </button>
        )}
        <button onClick={() => openDeleteDialog(blog, 'hard')} className="btn btn-xs btn-outline btn-error">
          刪除
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="部落格管理"
        actions={
          <Link href="/admin/blogs/new" className="btn btn-sm btn-primary">
            新增文章
          </Link>
        }
      />

      <BlogSubNav />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋文章標題或作者..."
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
            fetchBlogs({ page: 1, category: e.target.value });
          }}
          className="select select-sm"
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
          className="select select-sm"
        >
          <option value="">全部狀態</option>
          <option value="published">已發布</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>文章標題</th>
              <th>分類</th>
              <th>作者</th>
              <th>日期</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-base-content/40 py-8 text-center">
                  沒有找到文章
                </td>
              </tr>
            ) : (
              blogs.map((blog: any) => (
                <tr key={blog.id}>
                  <td>
                    <Link href={`/admin/blogs/${blog.id}/edit`} className="link link-hover font-medium">
                      {blog.title}
                    </Link>
                    <p className="text-base-content/40 mt-0.5 text-xs">{getTagNames(blog)}</p>
                  </td>
                  <td className="text-base-content/60">{blog.category_item || '-'}</td>
                  <td className="text-base-content/60">{blog.author}</td>
                  <td className="text-base-content/60">{blog.date}</td>
                  <td>
                    <span className={`badge badge-sm ${blog.published ? 'badge-success' : 'badge-ghost'}`}>{blog.published ? '已發布' : '草稿'}</span>
                  </td>
                  <td>
                    <BlogActions blog={blog} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {blogs.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">沒有找到文章</div>
        ) : (
          blogs.map((blog: any) => (
            <div key={blog.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/admin/blogs/${blog.id}/edit`} className="link link-hover font-medium">
                    {blog.title}
                  </Link>
                  <span className={`badge badge-sm ${blog.published ? 'badge-success' : 'badge-ghost'}`}>{blog.published ? '已發布' : '草稿'}</span>
                </div>
                <div className="text-base-content/50 text-xs">{getTagNames(blog)}</div>
                <div className="text-base-content/50 text-xs">
                  {blog.category_item || '未分類'} · {blog.author} · {blog.date}
                </div>
                <div className="card-actions justify-end">
                  <BlogActions blog={blog} />
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
        onPageChange={(p) => {
          fetchBlogs({ page: p });
        }}
      />

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
