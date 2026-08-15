'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/settings/settings-slice';

const SYNCED_FLAG = 'line_liff_session_synced';

/**
 * Only does anything when the page was actually opened through a LIFF URL
 * (liff.line.me/{liffId}/...) — e.g. from the official account's rich menu.
 * A normal site visit never touches LIFF at all; liff.init() no-ops quietly
 * for non-LIFF entries rather than erroring, so this stays silent for the
 * overwhelming majority of visitors.
 *
 * Flow: liff.init() → if already logged in (LIFF handles that redirect
 * itself), grab the ID token → POST it to /api/auth/line/liff, which
 * verifies it and sets the same Supabase session cookies LINE Login's OAuth
 * flow would. One reload afterward so the rest of the app picks up the new
 * session — everything server-rendered (account pages, etc.) reads it from
 * cookies, not from anything this component holds in memory.
 */
export default function LiffSessionProvider() {
  const liffId = useSettingsStore((s) => s.line_bot_liff_id);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!liffId || ranRef.current) return;
    // Don't re-sync every load once we've already exchanged the ID token
    // for a session this browser session.
    if (typeof window !== 'undefined' && sessionStorage.getItem(SYNCED_FLAG)) return;
    ranRef.current = true;

    (async () => {
      try {
        const { default: liff } = await import('@line/liff');
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) return;

        const idToken = liff.getIDToken();
        if (!idToken) return;

        const res = await fetch('/api/auth/line/liff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (res.ok) {
          sessionStorage.setItem(SYNCED_FLAG, 'true');
          // Reload so server-rendered pages and the Supabase client both
          // pick up the freshly-set session cookie.
          window.location.reload();
        }
      } catch {
        // Not opened via LIFF, camera/network unavailable, etc. — silent,
        // same as SettingsProvider's own error handling.
      }
    })();
  }, [liffId]);

  return null;
}
