'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UserTableProps {
  initialUsers: User[];
  currentUserId: string;
  mode?: 'admin' | 'member' | 'all';
}

export default function UserTable({ initialUsers, currentUserId, mode = 'all' }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);

  // Password reset state
  const [passwordId, setPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // Create user modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState('customer');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const pageTitle = mode === 'admin' ? '管理員' : mode === 'member' ? '會員管理' : '用戶管理';
  const createLabel = mode === 'admin' ? '新增管理員' : mode === 'member' ? '新增會員' : '新增用戶';
  const defaultCreateRole = mode === 'admin' ? 'admin' : 'customer';

  async function fetchUsers(params: { search?: string; role?: string }) {
    setLoading(true);
    const s = params.search ?? search;
    const r = params.role ?? roleFilter;
    const fixedRole = mode === 'admin' ? 'admin' : mode === 'member' ? 'customer' : r;
    const qs = new URLSearchParams({
      ...(s && { search: s }),
      ...(fixedRole && { role: fixedRole }),
    });
    try {
      const res = await fetch(`/api/admin/users?${qs}`);
      const data = await res.json();
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchUsers({ search });
  }

  // --- Edit ---
  function startEdit(user: User) {
    setEditingId(user.id);
    setEditName(user.full_name);
    setEditRole(user.role);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(userId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: editName, role: editRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, full_name: editName, role: editRole } : u
          )
        );
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  }

  // --- Password ---
  async function handlePasswordReset(userId: string) {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg('密碼至少 6 個字元');
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setPasswordMsg('密碼已更新');
        setNewPassword('');
        setTimeout(() => {
          setPasswordId(null);
          setPasswordMsg(null);
        }, 1500);
      } else {
        const data = await res.json();
        setPasswordMsg(data.error || '更新失敗');
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  // --- Delete ---
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const data = await res.json();
        setDeleteError(data.error || '刪除失敗');
      }
    } finally {
      setDeleting(false);
    }
  }

  // --- Create ---
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          full_name: createName,
          role: createRole,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => [data.user, ...prev]);
        setShowCreate(false);
        setCreateEmail('');
        setCreatePassword('');
        setCreateName('');
        setCreateRole('customer');
      } else {
        const data = await res.json();
        setCreateError(data.error || '建立失敗');
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
        <button
          onClick={() => {
            setShowCreate(true);
            setCreateRole(defaultCreateRole);
          }}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          {createLabel}
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋 Email 或名稱..."
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
          >
            搜尋
          </button>
        </form>
        {mode === 'all' && (
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              fetchUsers({ role: e.target.value });
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">全部角色</option>
            <option value="admin">管理員</option>
            <option value="customer">會員</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Email
                </th>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  名稱
                </th>
                {mode === 'all' && (
                  <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    角色
                  </th>
                )}
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  建立時間
                </th>
                <th className="w-[200px] px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={mode === 'all' ? 5 : 4} className="px-4 py-8 text-center text-sm text-gray-500">
                    載入中...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'all' ? 5 : 4} className="px-4 py-8 text-center text-sm text-gray-500">
                    沒有找到用戶
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.email}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-blue-500">(你)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">
                          {user.full_name || '-'}
                        </span>
                      )}
                    </td>
                    {mode === 'all' && (
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                          >
                            <option value="admin">管理員</option>
                            <option value="customer">會員</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {user.role === 'admin' ? '管理員' : '會員'}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingId === user.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(user.id)}
                              disabled={saving}
                              className="rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100 disabled:opacity-50"
                            >
                              {saving ? '儲存中...' : '儲存'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                            >
                              取消
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(user)}
                              className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => {
                                setPasswordId(user.id);
                                setNewPassword('');
                                setPasswordMsg(null);
                              }}
                              className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-100"
                            >
                              重設密碼
                            </button>
                            {user.id !== currentUserId && (
                              <button
                                onClick={() => {
                                  setDeleteTarget(user);
                                  setDeleteError(null);
                                }}
                                className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                              >
                                刪除
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {/* Password reset inline */}
                      {passwordId === user.id && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="新密碼（至少6字元）"
                            className="w-40 rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handlePasswordReset(user.id)}
                            disabled={passwordSaving}
                            className="rounded bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600 disabled:opacity-50"
                          >
                            {passwordSaving ? '...' : '確認'}
                          </button>
                          <button
                            onClick={() => {
                              setPasswordId(null);
                              setPasswordMsg(null);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                          {passwordMsg && (
                            <span className="text-xs text-green-600">{passwordMsg}</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除用戶"
        message={
          deleteError ||
          `確定要刪除「${deleteTarget?.email}」嗎？此操作無法復原！`
        }
        confirmLabel="確認刪除"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        loading={deleting}
      />

      {/* Create User Modal */}
      {showCreate && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => {
              setShowCreate(false);
              setCreateError(null);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">新增用戶</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    密碼 *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    名稱
                  </label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    角色
                  </label>
                  {mode === 'all' ? (
                    <select
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="customer">會員</option>
                      <option value="admin">管理員</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={mode === 'admin' ? '管理員' : '會員'}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                    />
                  )}
                </div>
                {createError && (
                  <p className="text-sm text-red-600">{createError}</p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setCreateError(null);
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {creating ? '建立中...' : '建立'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
