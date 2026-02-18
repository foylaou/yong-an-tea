'use client';

import { useState, useMemo } from 'react';

interface LinkItem {
  id: number;
  title: string;
  path: string;
}

interface MenuItem {
  id: number;
  title: string;
  path: string;
  holderCName: string;
  submenuCName?: string;
  headerSubmenu?: { id: string; submenuTitle: string; submenuPath: string }[];
}

interface HeaderFooterSettingsProps {
  initialData: Record<string, unknown>;
}

function parseJson<T>(data: Record<string, unknown>, key: string, fallback: T): T {
  try {
    const raw = data[key] as string;
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function HeaderFooterSettings({ initialData }: HeaderFooterSettingsProps) {
  // --- Header fields ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => parseJson(initialData, 'header_menu_json', []));
  const [headerContactTitle, setHeaderContactTitle] = useState((initialData.header_contact_title as string) || '聯繫我們');
  const [headerSocialTitle, setHeaderSocialTitle] = useState((initialData.header_social_title as string) || '追蹤我們的社群');

  // --- Footer fields ---
  const [footerAddressTitle, setFooterAddressTitle] = useState((initialData.footer_address_title as string) || '地址');
  const [footerInfoTitle, setFooterInfoTitle] = useState((initialData.footer_info_title as string) || '幫助與資訊');
  const [infoLinks, setInfoLinks] = useState<LinkItem[]>(() => parseJson(initialData, 'footer_info_links_json', []));
  const [footerAboutTitle, setFooterAboutTitle] = useState((initialData.footer_about_title as string) || '關於我們');
  const [aboutLinks, setAboutLinks] = useState<LinkItem[]>(() => parseJson(initialData, 'footer_about_links_json', []));
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState((initialData.footer_newsletter_title as string) || '電子報');
  const [menuLinks, setMenuLinks] = useState<LinkItem[]>(() => parseJson(initialData, 'footer_menu_links_json', []));
  const [footerSocialTitle, setFooterSocialTitle] = useState((initialData.footer_social_title as string) || '追蹤我們的社群');
  const [footerSocialMediaTitle, setFooterSocialMediaTitle] = useState((initialData.footer_social_media_title as string) || '社群媒體');
  const [footerLogoAlt, setFooterLogoAlt] = useState((initialData.footer_logo_alt as string) || '頁尾標誌');
  const [footerLogoPath, setFooterLogoPath] = useState((initialData.footer_logo_path as string) || '/');

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Menu JSON preview
  const menuJsonPreview = useMemo(() => JSON.stringify(menuItems, null, 2), [menuItems]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'header_footer',
          settings: {
            header_menu_json: JSON.stringify(menuItems),
            header_contact_title: headerContactTitle,
            header_social_title: headerSocialTitle,
            footer_address_title: footerAddressTitle,
            footer_info_title: footerInfoTitle,
            footer_info_links_json: JSON.stringify(infoLinks),
            footer_about_title: footerAboutTitle,
            footer_about_links_json: JSON.stringify(aboutLinks),
            footer_newsletter_title: footerNewsletterTitle,
            footer_menu_links_json: JSON.stringify(menuLinks),
            footer_social_title: footerSocialTitle,
            footer_social_media_title: footerSocialMediaTitle,
            footer_logo_alt: footerLogoAlt,
            footer_logo_path: footerLogoPath,
          },
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || '儲存失敗');
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setServerError('儲存失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  function addLink(setter: React.Dispatch<React.SetStateAction<LinkItem[]>>, list: LinkItem[]) {
    setter([...list, { id: Date.now(), title: '', path: '/' }]);
  }

  function removeLink(setter: React.Dispatch<React.SetStateAction<LinkItem[]>>, list: LinkItem[], index: number) {
    setter(list.filter((_, i) => i !== index));
  }

  function updateLink(setter: React.Dispatch<React.SetStateAction<LinkItem[]>>, list: LinkItem[], index: number, field: keyof LinkItem, value: string) {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setter(updated);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header Section */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Header 設定</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">聯繫標題</label>
              <input type="text" value={headerContactTitle} onChange={(e) => setHeaderContactTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">社群標題</label>
              <input type="text" value={headerSocialTitle} onChange={(e) => setHeaderSocialTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">導航選單 (JSON)</label>
            <textarea
              value={menuJsonPreview}
              onChange={(e) => {
                try { setMenuItems(JSON.parse(e.target.value)); } catch { /* ignore invalid JSON while typing */ }
              }}
              rows={10}
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            <p className="mt-1 text-xs text-gray-500">每項包含 id, title, path, holderCName, 可選 submenuCName 和 headerSubmenu</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Footer 設定</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">地址標題</label>
              <input type="text" value={footerAddressTitle} onChange={(e) => setFooterAddressTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">電子報標題</label>
              <input type="text" value={footerNewsletterTitle} onChange={(e) => setFooterNewsletterTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">社群標題</label>
              <input type="text" value={footerSocialTitle} onChange={(e) => setFooterSocialTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">社群媒體標題</label>
              <input type="text" value={footerSocialMediaTitle} onChange={(e) => setFooterSocialMediaTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Logo 替代文字</label>
              <input type="text" value={footerLogoAlt} onChange={(e) => setFooterLogoAlt(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Logo 連結路徑</label>
              <input type="text" value={footerLogoPath} onChange={(e) => setFooterLogoPath(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
        </div>
      </section>

      {/* Info Links */}
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{footerInfoTitle}</h2>
            <p className="text-sm text-gray-500">Footer「幫助與資訊」區塊的連結列表</p>
          </div>
          <button type="button" onClick={() => addLink(setInfoLinks, infoLinks)}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + 新增連結
          </button>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">區塊標題</label>
          <input type="text" value={footerInfoTitle} onChange={(e) => setFooterInfoTitle(e.target.value)}
            className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        {renderLinkList(infoLinks, setInfoLinks)}
      </section>

      {/* About Links */}
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{footerAboutTitle}</h2>
            <p className="text-sm text-gray-500">Footer「關於我們」區塊的連結列表</p>
          </div>
          <button type="button" onClick={() => addLink(setAboutLinks, aboutLinks)}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + 新增連結
          </button>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">區塊標題</label>
          <input type="text" value={footerAboutTitle} onChange={(e) => setFooterAboutTitle(e.target.value)}
            className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        </div>
        {renderLinkList(aboutLinks, setAboutLinks)}
      </section>

      {/* Menu Links */}
      <section className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">底部選單連結</h2>
            <p className="text-sm text-gray-500">Footer 底部的連結列表（服務條款、隱私權等）</p>
          </div>
          <button type="button" onClick={() => addLink(setMenuLinks, menuLinks)}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            + 新增連結
          </button>
        </div>
        {renderLinkList(menuLinks, setMenuLinks)}
      </section>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{serverError}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">設定已成功儲存</div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting}
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {submitting ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </form>
  );

  function renderLinkList(list: LinkItem[], setter: React.Dispatch<React.SetStateAction<LinkItem[]>>) {
    if (list.length === 0) {
      return <p className="py-4 text-center text-sm text-gray-400">尚無連結，請點擊「新增連結」</p>;
    }
    return (
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <input type="text" value={item.title} onChange={(e) => updateLink(setter, list, index, 'title', e.target.value)}
              placeholder="標題" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            <input type="text" value={item.path} onChange={(e) => updateLink(setter, list, index, 'path', e.target.value)}
              placeholder="路徑" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
            <button type="button" onClick={() => removeLink(setter, list, index)}
              className="text-xs text-red-600 hover:text-red-800">刪除</button>
          </div>
        ))}
      </div>
    );
  }
}
