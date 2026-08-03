import Link from 'next/link';

export function PosTopbar({ siteName }: { siteName: string }) {
  return (
    <div className="bg-base-100 border-base-300 flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="iconify lucide--store text-primary size-5" />
        <span className="font-semibold">{siteName} · 銷售模式</span>
      </div>
      <Link href="/admin" className="btn btn-outline btn-sm">
        <span className="iconify lucide--x size-4" />
        結束銷售模式
      </Link>
    </div>
  );
}
