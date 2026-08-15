import { useEffect, useState, useCallback } from 'react';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { liffStyles as s } from '../../lib/liff-admin-styles';

interface UserRow {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'customer';
    created_at: string;
}

type Status = 'init' | 'loading' | 'ready' | 'error';

/**
 * Two lists: current admins (with a "移除" button) and a search box to find
 * any account to promote. Reuses /api/admin/users as-is — that route
 * already merges auth.users + profiles and supports ?role=/?search=.
 */
export default function AdminUsersPage() {
    const liffId = useSettingsStore((s) => s.line_bot_liff_id);
    const [status, setStatus] = useState<Status>('init');
    const [errorText, setErrorText] = useState('');
    const [admins, setAdmins] = useState<UserRow[]>([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<UserRow[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadAdmins = useCallback(async () => {
        setStatus('loading');
        setErrorText('');
        try {
            const res = await fetch('/api/admin/users?role=admin');
            const data = await res.json();
            if (res.status === 403) {
                setErrorText('您沒有管理員權限。');
                setStatus('error');
                return;
            }
            if (!res.ok) {
                setErrorText(data.error || '讀取管理員清單失敗');
                setStatus('error');
                return;
            }
            setAdmins(data.users || []);
            setStatus('ready');
        } catch (err) {
            setErrorText(
                `讀取失敗：${err instanceof Error ? err.message : String(err)}`
            );
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        if (!liffId) return;
        (async () => {
            try {
                const { default: liff } = await import('@line/liff');
                await liff.init({ liffId });
                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }
                await loadAdmins();
            } catch {
                setErrorText(
                    'LIFF 初始化失敗，請確認是從 LINE 官方帳號的選單開啟。'
                );
                setStatus('error');
            }
        })();
    }, [liffId, loadAdmins]);

    async function handleSearch() {
        if (!search.trim()) {
            setSearchResults(null);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(
                `/api/admin/users?search=${encodeURIComponent(search.trim())}`
            );
            const data = await res.json();
            if (!res.ok) {
                setErrorText(data.error || '搜尋失敗');
                return;
            }
            setSearchResults(data.users || []);
        } catch (err) {
            setErrorText(
                `搜尋失敗：${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setSearching(false);
        }
    }

    async function setRole(userId: string, role: 'admin' | 'customer') {
        if (role === 'customer' && !confirm('確定要移除這個人的管理員權限嗎？'))
            return;
        setUpdatingId(userId);
        setErrorText('');
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorText(data.error || '更新失敗');
                return;
            }
            await loadAdmins();
            if (searchResults) {
                setSearchResults(
                    (prev) =>
                        prev?.map((u) =>
                            u.id === userId ? { ...u, role } : u
                        ) ?? null
                );
            }
        } catch (err) {
            setErrorText(
                `更新失敗：${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setUpdatingId(null);
        }
    }

    function renderRow(u: UserRow) {
        return (
            <div key={u.id} style={s.card}>
                <div style={{ fontWeight: 600 }}>
                    {u.full_name || '（未設定姓名）'}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>{u.email}</div>
                <span
                    style={{
                        ...s.badge(
                            u.role === 'admin' ? '#e6f0ff' : '#f2f2f2',
                            u.role === 'admin' ? '#1a56c2' : '#888'
                        ),
                        marginTop: 4,
                        display: 'inline-block',
                    }}
                >
                    {u.role === 'admin' ? '管理員' : '一般會員'}
                </span>
                <div style={{ marginTop: 10 }}>
                    {u.role === 'admin' ? (
                        <button
                            type="button"
                            disabled={updatingId === u.id}
                            onClick={() => setRole(u.id, 'customer')}
                            style={{ ...s.dangerButton, width: '100%' }}
                        >
                            {updatingId === u.id
                                ? '處理中...'
                                : '移除管理員權限'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={updatingId === u.id}
                            onClick={() => setRole(u.id, 'admin')}
                            style={{ ...s.primaryButton, width: '100%' }}
                        >
                            {updatingId === u.id ? '處理中...' : '設為管理員'}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                <h1 style={s.h1}>管理員權限</h1>

                {(status === 'init' || status === 'loading') && (
                    <p>載入中...</p>
                )}
                {status === 'error' && <p style={s.errorText}>{errorText}</p>}

                {status === 'ready' && (
                    <>
                        <h2
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                marginBottom: 8,
                            }}
                        >
                            目前的管理員（{admins.length}）
                        </h2>
                        {admins.map(renderRow)}

                        <h2
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                marginTop: 20,
                                marginBottom: 8,
                            }}
                        >
                            新增管理員
                        </h2>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                style={{ ...s.input, flex: 1 }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="搜尋姓名或 Email"
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                            />
                            <button
                                type="button"
                                disabled={searching}
                                onClick={handleSearch}
                                style={s.outlineButton}
                            >
                                搜尋
                            </button>
                        </div>

                        {searchResults &&
                            (searchResults.length === 0 ? (
                                <p style={{ color: '#666', marginTop: 8 }}>
                                    找不到符合的會員。
                                </p>
                            ) : (
                                <div style={{ marginTop: 8 }}>
                                    {searchResults.map(renderRow)}
                                </div>
                            ))}

                        {errorText && <p style={s.errorText}>{errorText}</p>}
                    </>
                )}
            </div>
        </div>
    );
}
