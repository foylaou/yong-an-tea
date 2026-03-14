import { useEffect, useState } from 'react';

/**
 * 7-11 電子地圖回傳頁面
 * 接收門市選擇結果，透過 localStorage 傳回給結帳頁
 * (window.opener 在跨域導航後會被瀏覽器安全策略清空，改用 storage event)
 */
export default function EMapCallbackPage() {
  const [status, setStatus] = useState('正在處理門市資訊...');

  useEffect(() => {
    // Parse query params directly from URL (don't wait for Next.js router)
    const params = new URLSearchParams(window.location.search);
    const storeid = params.get('storeid');

    if (!storeid) {
      setStatus('未收到門市資訊，請關閉此視窗重新選擇。');
      return;
    }

    const storeData = {
      storeid,
      storename: params.get('storename') || '',
      storeaddress: params.get('storeaddress') || '',
      outside: params.get('outside') || '0',
      ship: params.get('ship') || '',
    };

    // Method 1: Try postMessage (works if window.opener is still alive)
    if (window.opener) {
      try {
        window.opener.postMessage(
          { type: 'EMAP_STORE_SELECTED', store: storeData },
          window.location.origin,
        );
      } catch {
        // opener might be cross-origin blocked
      }
    }

    // Method 2: Use localStorage (always works, checkout page listens for storage event)
    try {
      localStorage.setItem(
        'emap_store_selected',
        JSON.stringify({ ...storeData, timestamp: Date.now() }),
      );
    } catch {
      // localStorage might be unavailable
    }

    setStatus(`已選擇門市：${storeData.storename}，視窗將自動關閉...`);

    // Auto-close after a short delay
    setTimeout(() => {
      window.close();
      // If window.close() doesn't work (some browsers block it),
      // show a manual close message
      setStatus(`已選擇門市：${storeData.storename}，請手動關閉此視窗。`);
    }, 1000);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">{status}</p>
    </div>
  );
}
