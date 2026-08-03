'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/admin/common/ConfirmDialog';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

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

export function UserTable({ initialUsers, currentUserId, mode = 'all' }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);

  const [passwordId, setPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

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
    const qs = new URLSearchParams({ ...(s && { search: s }), ...(fixedRole && { role: fixedRole }) });
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
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, full_name: editName, role: editRole } : u)));
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  }

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

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: createEmail, password: createPassword, full_name: createName, role: createRole }),
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

  function PasswordResetRow({ user }: { user: User }) {
    if (passwordId !== user.id) return null;
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新密碼（至少6字元）"
          className="input input-xs w-40"
        />
        <button onClick={() => handlePasswordReset(user.id)} disabled={passwordSaving} className="btn btn-xs btn-warning">
          {passwordSaving ? '...' : '確認'}
        </button>
        <button
          onClick={() => {
            setPasswordId(null);
            setPasswordMsg(null);
          }}
          className="text-base-content/50 hover:text-base-content text-xs"
        >
          取消
        </button>
        {passwordMsg && <span className="text-success text-xs">{passwordMsg}</span>}
      </div>
    );
  }

  function UserActions({ user }: { user: User }) {
    if (editingId === user.id) {
      return (
        <div className="flex gap-2">
          <button onClick={() => saveEdit(user.id)} disabled={saving} className="btn btn-xs btn-outline btn-success">
            {saving ? '儲存中...' : '儲存'}
          </button>
          <button onClick={cancelEdit} className="btn btn-xs btn-outline">
            取消
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={() => startEdit(user)} className="btn btn-xs btn-outline btn-info">
          編輯
        </button>
        <button
          onClick={() => {
            setPasswordId(user.id);
            setNewPassword('');
            setPasswordMsg(null);
          }}
          className="btn btn-xs btn-outline btn-warning"
        >
          重設密碼
        </button>
        {user.id !== currentUserId && (
          <button
            onClick={() => {
              setDeleteTarget(user);
              setDeleteError(null);
            }}
            className="btn btn-xs btn-outline btn-error"
          >
            刪除
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={pageTitle}
        actions={
          <button
            onClick={() => {
              setShowCreate(true);
              setCreateRole(defaultCreateRole);
            }}
            className="btn btn-sm btn-primary"
          >
            {createLabel}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋 Email 或名稱..."
            className="input input-sm w-56"
          />
          <button type="submit" className="btn btn-sm btn-outline">
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
            className="select select-sm"
          >
            <option value="">全部角色</option>
            <option value="admin">管理員</option>
            <option value="customer">會員</option>
          </select>
        )}
      </div>

      {/* Desktop table */}
      <div className={`hidden overflow-x-auto md:block ${loading ? 'opacity-50' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>名稱</th>
              {mode === 'all' && <th>角色</th>}
              <th>建立時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={mode === 'all' ? 5 : 4} className="text-base-content/40 py-8 text-center">
                  沒有找到用戶
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.email}
                    {user.id === currentUserId && <span className="text-primary ml-2 text-xs">(你)</span>}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input input-sm w-full" />
                    ) : (
                      <span className="text-base-content/60">{user.full_name || '-'}</span>
                    )}
                  </td>
                  {mode === 'all' && (
                    <td>
                      {editingId === user.id ? (
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="select select-sm">
                          <option value="admin">管理員</option>
                          <option value="customer">會員</option>
                        </select>
                      ) : (
                        <span className={`badge badge-sm ${user.role === 'admin' ? 'badge-secondary' : 'badge-success'}`}>
                          {user.role === 'admin' ? '管理員' : '會員'}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="text-base-content/50">{new Date(user.created_at).toLocaleDateString('zh-TW')}</td>
                  <td>
                    <UserActions user={user} />
                    <PasswordResetRow user={user} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet card list */}
      <div className={`space-y-3 md:hidden ${loading ? 'opacity-50' : ''}`}>
        {users.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">沒有找到用戶</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="card card-border">
              <div className="card-body gap-2 p-4">
                <div className="text-sm">
                  {user.email}
                  {user.id === currentUserId && <span className="text-primary ml-2 text-xs">(你)</span>}
                </div>
                {editingId === user.id ? (
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input input-sm w-full" />
                ) : (
                  <div className="text-base-content/60 text-sm">{user.full_name || '-'}</div>
                )}
                {mode === 'all' &&
                  (editingId === user.id ? (
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="select select-sm">
                      <option value="admin">管理員</option>
                      <option value="customer">會員</option>
                    </select>
                  ) : (
                    <span className={`badge badge-sm w-fit ${user.role === 'admin' ? 'badge-secondary' : 'badge-success'}`}>
                      {user.role === 'admin' ? '管理員' : '會員'}
                    </span>
                  ))}
                <div className="text-base-content/40 text-xs">{new Date(user.created_at).toLocaleDateString('zh-TW')}</div>
                <div className="card-actions justify-end">
                  <UserActions user={user} />
                </div>
                <PasswordResetRow user={user} />
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除用戶"
        message={deleteError || `確定要刪除「${deleteTarget?.email}」嗎？此操作無法復原！`}
        confirmLabel="確認刪除"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        loading={deleting}
      />

      {showCreate && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-semibold">新增用戶</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Email *</legend>
                <input type="email" required value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">密碼 *</legend>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="input w-full"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">名稱</legend>
                <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} className="input w-full" />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">角色</legend>
                {mode === 'all' ? (
                  <select value={createRole} onChange={(e) => setCreateRole(e.target.value)} className="select w-full">
                    <option value="customer">會員</option>
                    <option value="admin">管理員</option>
                  </select>
                ) : (
                  <input type="text" readOnly value={mode === 'admin' ? '管理員' : '會員'} className="input w-full opacity-60" />
                )}
              </fieldset>
              {createError && <p className="text-error text-sm">{createError}</p>}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError(null);
                  }}
                  className="btn btn-outline"
                >
                  取消
                </button>
                <button type="submit" disabled={creating} className="btn btn-primary">
                  {creating ? '建立中...' : '建立'}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowCreate(false);
              setCreateError(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
