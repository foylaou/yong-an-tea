interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-base-content/60 text-sm">
        共 <span className="font-medium">{total}</span> 筆，第 <span className="font-medium">{page}</span> / {totalPages} 頁
      </p>
      <div className="join">
        <button
          type="button"
          className="join-item btn btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          上一頁
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <button key={`ellipsis-${i}`} type="button" className="join-item btn btn-sm btn-disabled">
              …
            </button>
          ) : (
            <button
              key={p}
              type="button"
              className={`join-item btn btn-sm ${p === page ? 'btn-active btn-primary' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className="join-item btn btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          下一頁
        </button>
      </div>
    </div>
  );
}
