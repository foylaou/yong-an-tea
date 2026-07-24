import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const PAGE_NUMBER_LIMIT = 9;

function readPageFromQuery(query: Record<string, string | string[] | undefined>): number {
  const raw = query.page;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/**
 * Product listing pagination, synced to the `page` query string so that
 * navigating away (e.g. into a product) and back restores the page the
 * user was on, instead of resetting to page 1.
 */
export function useProductPagination(totalPages: number) {
  const router = useRouter();
  const [currentPage, setCurrentPageState] = useState(() => readPageFromQuery(router.query));

  // Browser back/forward or a fresh navigation with ?page= in the URL.
  useEffect(() => {
    const fromUrl = readPageFromQuery(router.query);
    setCurrentPageState((prev) => (prev !== fromUrl ? fromUrl : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.page]);

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageState(page);
      if (!router.isReady) return;
      router.replace(
        { pathname: router.pathname, query: { ...router.query, page: String(page) } },
        undefined,
        { shallow: true },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady, router.pathname],
  );

  // Reflect the initial/current page in the URL (adds page=1 by default),
  // and clamp to the last available page once filtering shrinks the total.
  useEffect(() => {
    if (!router.isReady) return;
    const clamped = totalPages > 0 && currentPage > totalPages ? totalPages : currentPage;
    if (clamped !== currentPage) {
      setCurrentPage(clamped);
      return;
    }
    if (readPageFromQuery(router.query) !== currentPage) {
      setCurrentPage(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, currentPage, totalPages]);

  const maxPageNumberLimit = Math.ceil(currentPage / PAGE_NUMBER_LIMIT) * PAGE_NUMBER_LIMIT;
  const minPageNumberLimit = maxPageNumberLimit - PAGE_NUMBER_LIMIT;

  const handleNextbtn = useCallback(() => setCurrentPage(currentPage + 1), [currentPage, setCurrentPage]);
  const handlePrevbtn = useCallback(() => setCurrentPage(currentPage - 1), [currentPage, setCurrentPage]);

  return {
    currentPage,
    setCurrentPage,
    handleNextbtn,
    handlePrevbtn,
    pageNumberLimit: PAGE_NUMBER_LIMIT,
    maxPageNumberLimit,
    minPageNumberLimit,
  };
}
