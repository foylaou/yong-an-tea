/**
 * Site-wide image cache backed by IndexedDB.
 * Stores fetched image bytes as Blobs so repeat views don't re-download.
 */
const DB_NAME = 'image-cache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const CACHED_AT_INDEX = 'cachedAt';

// Prefer the Storage API's actual quota/usage (same approach web.dev
// recommends: https://web.dev/articles/storage-for-the-web) over a
// hardcoded entry count, and only start evicting once the origin is
// genuinely close to running out of space.
const QUOTA_PRUNE_THRESHOLD = 0.8;
const QUOTA_PRUNE_BATCH_SIZE = 50;
// Safety net for browsers without the Storage API (e.g. older Safari).
const FALLBACK_MAX_ENTRIES = 2000;

interface CachedRecord {
  url: string;
  blob: Blob;
  cachedAt: number;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
            store.createIndex(CACHED_AT_INDEX, 'cachedAt');
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  return dbPromise;
}

export async function getCachedImage(url: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    if (!db) return null;

    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(url);
      request.onsuccess = () => {
        const record = request.result as CachedRecord | undefined;
        resolve(record?.blob ?? null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function isNearStorageQuota(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return false;
  }
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return quota > 0 && usage / quota >= QUOTA_PRUNE_THRESHOLD;
  } catch {
    return false;
  }
}

function countEntries(db: IDBDatabase): Promise<number> {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(0);
  });
}

function pruneOldest(db: IDBDatabase, count: number): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.objectStore(STORE_NAME).index(CACHED_AT_INDEX);
    let deleted = 0;
    const cursorRequest = index.openCursor();
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor || deleted >= count) {
        resolve();
        return;
      }
      cursor.delete();
      deleted += 1;
      cursor.continue();
    };
    cursorRequest.onerror = () => resolve();
  });
}

export async function putCachedImage(url: string, blob: Blob): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ url, blob, cachedAt: Date.now() } satisfies CachedRecord);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    // Quota-based eviction is the primary mechanism; the entry-count
    // fallback only kicks in for browsers without navigator.storage.estimate().
    if (await isNearStorageQuota()) {
      await pruneOldest(db, QUOTA_PRUNE_BATCH_SIZE);
      return;
    }

    const count = await countEntries(db);
    if (count > FALLBACK_MAX_ENTRIES) {
      await pruneOldest(db, count - FALLBACK_MAX_ENTRIES);
    }
  } catch {
    // Caching is a best-effort optimization; ignore failures.
  }
}
