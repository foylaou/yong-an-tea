// Wrappers around LINE's Rich Menu Messaging API endpoints. There's no
// "update" — changing a rich menu means create a new one, upload its image,
// re-link whoever had the old one, then delete the old one. See
// src/app/api/admin/line-richmenu/[id]/apply/route.ts for that sequence.

export type RichMenuAction =
  | { type: 'uri'; uri: string }
  | { type: 'message'; text: string }
  | { type: 'postback'; data: string; displayText?: string }
  // Switches the user to a different rich menu. richMenuAliasId — not a raw
  // richMenuId — so the target stays valid across the target menu being
  // recreated (LINE aliases are exactly for this: a stable name that gets
  // repointed at a new richMenuId each time that menu is re-applied).
  | { type: 'richmenuswitch'; richMenuAliasId: string; data: string };

interface RichMenuArea {
  bounds: { x: number; y: number; width: number; height: number };
  action: RichMenuAction;
}

interface RichMenuPayload {
  size: { width: number; height: number };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: RichMenuArea[];
}

// --- Grid templates ------------------------------------------------------
// Presets only for the admin UI's convenience (a picker), not an API
// limitation — LINE's `areas` array accepts arbitrary rectangles. All
// templates share LINE's "large" canvas size; a 1-row template just leaves
// the bottom portion of that canvas to be part of the image/cells anyway
// (still has to be a 2500x1686 image).

export interface RichMenuTemplate {
  id: string;
  label: string;
  rows: number;
  cols: number;
}

export const RICHMENU_TEMPLATES: RichMenuTemplate[] = [
  { id: '1x1', label: '單一按鈕', rows: 1, cols: 1 },
  { id: '2x1', label: '左右 2 格', rows: 1, cols: 2 },
  { id: '3x1', label: '左中右 3 格', rows: 1, cols: 3 },
  { id: '1x2', label: '上下 2 格', rows: 2, cols: 1 },
  { id: '2x2', label: '2 x 2（4 格）', rows: 2, cols: 2 },
  { id: '3x2', label: '3 x 2（6 格）', rows: 2, cols: 3 },
];

export const RICHMENU_SIZE = { width: 2500, height: 1686 };

// --- LIFF-backed pages -----------------------------------------------------
// The registry a "LIFF 頁面功能" button action picks from — add an entry
// here whenever a new src/pages/liff/*.tsx page ships, so it shows up as a
// dropdown option instead of the admin having to hand-type
// `https://liff.line.me/{liffId}/liff/whatever`.

export interface LiffFeature {
  path: string; // appended to https://liff.line.me/{liffId}
  label: string;
}

export const LIFF_FEATURES: LiffFeature[] = [
  { path: '/liff/admin-coupon', label: '發放優惠券（Admin）' },
  { path: '/liff/my-qr', label: '我的會員條碼' },
  { path: '/liff/admin-orders', label: '今日訂單（Admin）' },
  { path: '/liff/admin-coupons', label: '優惠券管理（Admin）' },
  { path: '/liff/admin-users', label: '管理員權限（Admin）' },
  // Not a /liff/* page — an ordinary storefront route. Works the same way:
  // LiffSessionProvider (mounted globally in _app.tsx) carries the LINE
  // login over to *any* page opened through a liff.line.me URL, not just
  // ones under src/pages/liff/. Points at the product catalog rather than
  // the homepage since "quickly log in and buy" is the point, not browsing
  // hero banners.
  { path: '/products', label: '商店（快速登入購買）' },
];

/** Turns a { type: 'liff', path } action into the uri action LINE actually needs. */
export function resolveLiffAction(path: string, liffId: string): RichMenuAction {
  return { type: 'uri', uri: `https://liff.line.me/${liffId}${path}` };
}

export function templateCellCount(templateId: string): number {
  const t = RICHMENU_TEMPLATES.find((t) => t.id === templateId);
  return t ? t.rows * t.cols : 0;
}

/** Row-major: actions[0] is the top-left cell, filled left-to-right then top-to-bottom. */
export function buildAreasFromTemplate(templateId: string, actions: RichMenuAction[]): RichMenuArea[] {
  const t = RICHMENU_TEMPLATES.find((t) => t.id === templateId);
  if (!t) throw new Error(`Unknown rich menu template: ${templateId}`);

  const cellWidth = Math.floor(RICHMENU_SIZE.width / t.cols);
  const cellHeight = Math.floor(RICHMENU_SIZE.height / t.rows);
  const areas: RichMenuArea[] = [];

  let i = 0;
  for (let row = 0; row < t.rows; row++) {
    for (let col = 0; col < t.cols; col++) {
      if (i >= actions.length) break;
      areas.push({
        bounds: {
          x: col * cellWidth,
          y: row * cellHeight,
          // Last column/row absorbs the rounding remainder so the areas
          // tile the canvas exactly instead of leaving a dead strip.
          width: col === t.cols - 1 ? RICHMENU_SIZE.width - col * cellWidth : cellWidth,
          height: row === t.rows - 1 ? RICHMENU_SIZE.height - row * cellHeight : cellHeight,
        },
        action: actions[i],
      });
      i++;
    }
  }
  return areas;
}

/** LINE's richMenuAliasId only allows a limited charset — derive a safe one from our own `name` column. */
export function toAliasId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 32) || 'menu'
  );
}

// --- API calls -------------------------------------------------------------

// Rich menu image upload/download is the one set of endpoints LINE serves
// from a separate "data API" host — every other rich menu call (create,
// delete, list, link, alias) is on api.line.me. Missing this split produces
// a 404 on the content endpoint specifically — it's not a permissions or
// "wrong richMenuId" error.
const API_HOST = 'https://api.line.me';
const DATA_API_HOST = 'https://api-data.line.me';

async function callLineApi(
  path: string,
  init: RequestInit,
  accessToken: string,
  host: string = API_HOST
): Promise<Response> {
  const res = await fetch(`${host}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LINE Rich Menu API ${path} failed: ${res.status} ${body}`);
  }
  return res;
}

export async function createRichMenu(payload: RichMenuPayload, accessToken: string): Promise<string> {
  const res = await callLineApi(
    '/v2/bot/richmenu',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
    accessToken
  );
  const { richMenuId } = await res.json();
  return richMenuId;
}

export async function uploadRichMenuImage(
  richMenuId: string,
  imageBuffer: Buffer,
  contentType: string,
  accessToken: string
): Promise<void> {
  await callLineApi(
    `/v2/bot/richmenu/${richMenuId}/content`,
    { method: 'POST', headers: { 'Content-Type': contentType }, body: new Uint8Array(imageBuffer) },
    accessToken,
    DATA_API_HOST
  );
}

export async function linkRichMenuToUser(userId: string, richMenuId: string, accessToken: string): Promise<void> {
  await callLineApi(`/v2/bot/user/${userId}/richmenu/${richMenuId}`, { method: 'POST' }, accessToken);
}

export async function setDefaultRichMenu(richMenuId: string, accessToken: string): Promise<void> {
  await callLineApi(`/v2/bot/user/all/richmenu/${richMenuId}`, { method: 'POST' }, accessToken);
}

export async function deleteRichMenu(richMenuId: string, accessToken: string): Promise<void> {
  await callLineApi(`/v2/bot/richmenu/${richMenuId}`, { method: 'DELETE' }, accessToken);
}

export async function listRichMenus(accessToken: string): Promise<{ richMenuId: string; name: string }[]> {
  const res = await callLineApi('/v2/bot/richmenu/list', { method: 'GET' }, accessToken);
  const { richmenus } = await res.json();
  return richmenus;
}

/**
 * Points `aliasId` at `richMenuId`, creating the alias the first time and
 * repointing it on every call after — this is what lets richmenuswitch
 * actions keep working across a menu being recreated. Tries update first
 * since that's the common case (re-applying an existing menu); falls back
 * to create only on the first-ever apply.
 */
export async function upsertRichMenuAlias(aliasId: string, richMenuId: string, accessToken: string): Promise<void> {
  try {
    await callLineApi(
      `/v2/bot/richmenu/alias/${aliasId}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ richMenuId }) },
      accessToken
    );
  } catch {
    await callLineApi(
      '/v2/bot/richmenu/alias',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ richMenuAliasId: aliasId, richMenuId }),
      },
      accessToken
    );
  }
}

export async function deleteRichMenuAlias(aliasId: string, accessToken: string): Promise<void> {
  // Best-effort — fine if it never existed (menu was never applied before).
  await callLineApi(`/v2/bot/richmenu/alias/${aliasId}`, { method: 'DELETE' }, accessToken).catch(() => {});
}
