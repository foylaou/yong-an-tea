interface SEOPreviewProps {
  title?: string;
  description?: string;
  url?: string;
}

export function SEOPreview({ title, description, url }: SEOPreviewProps) {
  const displayTitle = title || '頁面標題';
  const displayDesc = description || '頁面描述將顯示在這裡...';
  const displayUrl = url || 'https://example.com/page';

  const titleLen = title?.length || 0;
  const descLen = description?.length || 0;

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body">
        {/* Deliberately mimics Google's actual SERP colors, not the app theme */}
        <h3 className="text-base-content/60 mb-1 text-sm font-medium">Google 搜尋預覽</h3>
        <div className="space-y-1">
          <p className="truncate text-xl leading-snug" style={{ color: '#1a0dab' }}>
            {displayTitle}
          </p>
          <p className="truncate text-sm" style={{ color: '#006621' }}>
            {displayUrl}
          </p>
          <p className="text-base-content/60 line-clamp-2 text-sm">{displayDesc}</p>
        </div>
        <div className="text-base-content/40 mt-3 flex gap-4 text-xs">
          <span className={titleLen > 60 ? 'text-error font-medium' : ''}>
            Title: {titleLen}/60
            {titleLen > 60 && ' (過長)'}
          </span>
          <span className={descLen > 160 ? 'text-error font-medium' : ''}>
            Description: {descLen}/160
            {descLen > 160 && ' (過長)'}
          </span>
        </div>
      </div>
    </div>
  );
}
