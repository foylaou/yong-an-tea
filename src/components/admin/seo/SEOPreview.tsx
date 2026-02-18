'use client';

interface SEOPreviewProps {
  title?: string;
  description?: string;
  url?: string;
}

export default function SEOPreview({ title, description, url }: SEOPreviewProps) {
  const displayTitle = title || '頁面標題';
  const displayDesc = description || '頁面描述將顯示在這裡...';
  const displayUrl = url || 'https://example.com/page';

  const titleLen = title?.length || 0;
  const descLen = description?.length || 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-500">Google 搜尋預覽</h3>
      <div className="space-y-1">
        <p
          className="truncate text-xl leading-snug"
          style={{ color: '#1a0dab' }}
        >
          {displayTitle}
        </p>
        <p className="truncate text-sm" style={{ color: '#006621' }}>
          {displayUrl}
        </p>
        <p className="line-clamp-2 text-sm text-gray-600">{displayDesc}</p>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-gray-400">
        <span className={titleLen > 60 ? 'text-red-500 font-medium' : ''}>
          Title: {titleLen}/60
          {titleLen > 60 && ' (過長)'}
        </span>
        <span className={descLen > 160 ? 'text-red-500 font-medium' : ''}>
          Description: {descLen}/160
          {descLen > 160 && ' (過長)'}
        </span>
      </div>
    </div>
  );
}
