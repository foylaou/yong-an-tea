import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import NewsletterList from '@/components/admin/newsletter/NewsletterList';

const PER_PAGE = 20;

export default async function NewsletterPage() {
  const supabase = await createClient();

  const { data: newsletters, count } = await supabase
    .from('newsletters')
    .select('id, subject, status, sent_count, sent_at, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">電子報管理</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/newsletter/subscribers"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            訂閱者列表
          </Link>
          <Link
            href="/admin/newsletter/new"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            撰寫電子報
          </Link>
        </div>
      </div>
      <NewsletterList
        initialNewsletters={newsletters || []}
        initialTotal={count || 0}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}
