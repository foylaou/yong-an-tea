'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RICHMENU_TEMPLATES, templateCellCount, LIFF_FEATURES } from '@/lib/line-richmenu';
import { BOT_TEXT_PRESETS } from '@/lib/line-bot-keywords';
import type { RichMenuActionData } from '@/lib/validations/line-richmenu';

const CUSTOM_TEXT_VALUE = '__custom__';

// TS can't narrow `button.action.text` inside a .some()/.map() closure the
// way it can right after an `if` — a plain function does its own narrowing
// on its own parameter instead of relying on the caller's control flow.
function messageText(action: RichMenuActionData): string {
  return action.type === 'message' ? action.text : '';
}

interface RichMenuRow {
  id: string;
  name: string;
  chat_bar_text: string;
  template: string;
  buttons: { label: string; action: RichMenuActionData }[];
  image_url: string | null;
  target: 'all' | 'admin';
  line_richmenu_id: string | null;
  applied_at: string | null;
}

const ACTION_TYPE_LABEL: Record<RichMenuActionData['type'], string> = {
  none: '（不設定）',
  uri: '開啟網址',
  liff: 'LIFF 頁面功能',
  message: '傳送文字訊息',
  postback: 'Postback',
  richmenuswitch: '切換到其他選單',
};

function emptyButton(): { label: string; action: RichMenuActionData } {
  return { label: '', action: { type: 'none' } };
}

function makeButtons(count: number, existing: { label: string; action: RichMenuActionData }[] = []) {
  return Array.from({ length: count }, (_, i) => existing[i] ?? emptyButton());
}

function blankForm() {
  return {
    id: null as string | null,
    name: '',
    chat_bar_text: '選單',
    template: '1x1',
    buttons: makeButtons(1),
    image_url: null as string | null,
    target: 'all' as 'all' | 'admin',
  };
}

export default function LineRichMenuSettings() {
  const [menus, setMenus] = useState<RichMenuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/line-richmenu');
      const data = await res.json();
      if (res.ok) setMenus(data.richmenus || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  function startNew() {
    setForm(blankForm());
    setError(null);
    setResult(null);
  }

  function startEdit(row: RichMenuRow) {
    setForm({
      id: row.id,
      name: row.name,
      chat_bar_text: row.chat_bar_text,
      template: row.template,
      buttons: makeButtons(templateCellCount(row.template), row.buttons),
      image_url: row.image_url,
      target: row.target,
    });
    setError(null);
    setResult(null);
  }

  function handleTemplateChange(template: string) {
    setForm((f) => ({ ...f, template, buttons: makeButtons(templateCellCount(template), f.buttons) }));
  }

  function updateButtonAction(index: number, action: RichMenuActionData) {
    setForm((f) => ({
      ...f,
      buttons: f.buttons.map((b, i) => (i === index ? { ...b, action } : b)),
    }));
  }

  function updateButtonLabel(index: number, label: string) {
    setForm((f) => ({
      ...f,
      buttons: f.buttons.map((b, i) => (i === index ? { ...b, label } : b)),
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setError(null);
    try {
      const key = `line-richmenu-${form.name || 'draft'}-${Date.now()}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      const res = await fetch('/api/admin/upload-site-asset', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '上傳失敗');
      setForm((f) => ({ ...f, image_url: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '圖片上傳失敗');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        name: form.name,
        chat_bar_text: form.chat_bar_text,
        template: form.template,
        buttons: form.buttons,
        image_url: form.image_url,
        target: form.target,
      };
      const res = await fetch(form.id ? `/api/admin/line-richmenu/${form.id}` : '/api/admin/line-richmenu', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '儲存失敗');
      setResult('已儲存草稿，按「套用」才會實際推上 LINE。');
      await loadMenus();
      startEdit(data.richmenu);
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存失敗');
    } finally {
      setSaving(false);
    }
  }

  async function handleApply(id: string) {
    setApplyingId(id);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/line-richmenu/${id}/apply`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '套用失敗');
      setResult(
        data.linkedCount != null
          ? `已套用，連結給 ${data.linkedCount}/${data.totalAdmins} 位已綁定 LINE 的管理員`
          : '已套用為所有好友的預設選單'
      );
      await loadMenus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '套用失敗');
    } finally {
      setApplyingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除這個選單嗎？如果已經套用過，會一併從 LINE 移除。')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/line-richmenu/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '刪除失敗');
      if (form.id === id) startNew();
      await loadMenus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗');
    }
  }

  const otherMenuNames = menus.map((m) => m.name).filter((n) => n !== form.name);

  return (
    <div className="space-y-6">
      <div className="card card-border bg-base-100">
        <div className="card-body">
          <h2 className="card-title">圖文選單清單</h2>
          {loading ? (
            <p className="text-base-content/60 text-sm">載入中...</p>
          ) : menus.length === 0 ? (
            <p className="text-base-content/60 text-sm">還沒有任何選單，在下方建立第一個。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>名稱</th>
                    <th>版型</th>
                    <th>對象</th>
                    <th>狀態</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {menus.map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.template}</td>
                      <td>{m.target === 'all' ? '所有好友' : '限管理員'}</td>
                      <td>
                        {m.line_richmenu_id ? (
                          <span className="badge badge-success badge-sm">已套用</span>
                        ) : (
                          <span className="badge badge-ghost badge-sm">草稿</span>
                        )}
                      </td>
                      <td className="flex gap-2">
                        <button type="button" className="btn btn-outline btn-xs" onClick={() => startEdit(m)}>
                          編輯
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          disabled={applyingId === m.id}
                          onClick={() => handleApply(m.id)}
                        >
                          {applyingId === m.id ? '套用中...' : '套用'}
                        </button>
                        <button type="button" className="btn btn-error btn-outline btn-xs" onClick={() => handleDelete(m.id)}>
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card card-border bg-base-100">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">{form.id ? `編輯：${form.name}` : '新增選單'}</h2>
            {form.id && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={startNew}>
                改為新增
              </button>
            )}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">名稱</legend>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="例如 main-menu"
                className="input w-full"
              />
              <p className="fieldset-label">英數字/底線/連字號，儲存後也是「切換選單」按鈕會用到的識別名稱</p>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">選單標籤文字</legend>
              <input
                type="text"
                value={form.chat_bar_text}
                onChange={(e) => setForm((f) => ({ ...f, chat_bar_text: e.target.value }))}
                maxLength={14}
                className="input w-full"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">版型</legend>
              <select
                value={form.template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="select w-full"
              >
                {RICHMENU_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">套用對象</legend>
              <select
                value={form.target}
                onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as 'all' | 'admin' }))}
                className="select w-full"
              >
                <option value="all">所有好友（設為預設選單）</option>
                <option value="admin">限管理員（已綁定 LINE 的角色為管理員的帳號）</option>
              </select>
            </fieldset>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center gap-3">
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" />
              <button type="button" disabled={imageUploading} onClick={() => imageInputRef.current?.click()} className="btn btn-outline btn-sm">
                {imageUploading ? '上傳中...' : '上傳選單圖片'}
              </button>
              <span className="text-base-content/60 text-xs">2500 x 1686 px，JPEG/PNG，1MB 以內</span>
            </div>
            {form.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="選單預覽" className="max-w-xs rounded border border-gray-200" />
            )}
          </div>

          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium">按鈕動作（依版型格數，左到右、上到下）</h3>
            {form.buttons.map((button, i) => (
              <div key={i} className="border-base-300 rounded-lg border p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <input
                    type="text"
                    value={button.label}
                    onChange={(e) => updateButtonLabel(i, e.target.value)}
                    placeholder={`第 ${i + 1} 格備註（自己看的，不會顯示在 LINE 上）`}
                    className="input input-sm w-full"
                  />
                  <select
                    value={button.action.type}
                    onChange={(e) => {
                      const type = e.target.value as RichMenuActionData['type'];
                      const next: RichMenuActionData =
                        type === 'none'
                          ? { type: 'none' }
                          : type === 'uri'
                            ? { type: 'uri', uri: '' }
                            : type === 'liff'
                              ? { type: 'liff', path: '' }
                              : type === 'message'
                                ? { type: 'message', text: '' }
                                : type === 'postback'
                                  ? { type: 'postback', data: '' }
                                  : { type: 'richmenuswitch', targetMenuName: '' };
                      updateButtonAction(i, next);
                    }}
                    className="select select-sm w-full"
                  >
                    {(Object.keys(ACTION_TYPE_LABEL) as RichMenuActionData['type'][]).map((t) => (
                      <option key={t} value={t}>
                        {ACTION_TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>

                  {button.action.type === 'uri' && (
                    <input
                      type="text"
                      value={button.action.uri}
                      onChange={(e) => updateButtonAction(i, { type: 'uri', uri: e.target.value })}
                      placeholder="https://..."
                      className="input input-sm w-full"
                    />
                  )}
                  {button.action.type === 'liff' && (
                    <select
                      value={button.action.path}
                      onChange={(e) => updateButtonAction(i, { type: 'liff', path: e.target.value })}
                      className="select select-sm w-full"
                    >
                      <option value="">請選擇 LIFF 頁面</option>
                      {LIFF_FEATURES.map((f) => (
                        <option key={f.path} value={f.path}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {button.action.type === 'message' && (
                    <div className="flex flex-col gap-2">
                      <select
                        value={BOT_TEXT_PRESETS.some((p) => p.value === messageText(button.action)) ? messageText(button.action) : CUSTOM_TEXT_VALUE}
                        onChange={(e) => {
                          if (e.target.value === CUSTOM_TEXT_VALUE) {
                            updateButtonAction(i, { type: 'message', text: '' });
                          } else {
                            updateButtonAction(i, { type: 'message', text: e.target.value });
                          }
                        }}
                        className="select select-sm w-full"
                      >
                        <option value={CUSTOM_TEXT_VALUE}>自訂訊息...</option>
                        {BOT_TEXT_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}（送出「{p.value}」）
                          </option>
                        ))}
                      </select>
                      {!BOT_TEXT_PRESETS.some((p) => p.value === messageText(button.action)) && (
                        <input
                          type="text"
                          value={button.action.text}
                          onChange={(e) => updateButtonAction(i, { type: 'message', text: e.target.value })}
                          placeholder="輸入要送出的文字，例如：訂單"
                          className="input input-sm w-full"
                        />
                      )}
                    </div>
                  )}
                  {button.action.type === 'postback' && (
                    <input
                      type="text"
                      value={button.action.data}
                      onChange={(e) => updateButtonAction(i, { type: 'postback', data: e.target.value })}
                      placeholder="postback data"
                      className="input input-sm w-full"
                    />
                  )}
                  {button.action.type === 'richmenuswitch' && (
                    <select
                      value={button.action.targetMenuName}
                      onChange={(e) => updateButtonAction(i, { type: 'richmenuswitch', targetMenuName: e.target.value })}
                      className="select select-sm w-full"
                    >
                      <option value="">請選擇選單</option>
                      {otherMenuNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && <div className="alert alert-error mt-3 text-sm">{error}</div>}
          {result && <div className="alert alert-success mt-3 text-sm">{result}</div>}

          <div className="mt-4 flex justify-end">
            <button type="button" disabled={saving || !form.name} onClick={handleSave} className="btn btn-primary">
              {saving ? '儲存中...' : form.id ? '儲存變更' : '建立草稿'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
