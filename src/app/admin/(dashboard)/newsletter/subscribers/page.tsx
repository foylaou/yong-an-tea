import { createClient } from '@/lib/supabase/server';
import SubscriberList from '@/components/admin/newsletter/SubscriberList';

const PER_PAGE = 20;

export default async function SubscribersPage() {
  const supabase = await createClient();

  const { data: subscribers, count } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">電子報訂閱者</h1>
      </div>
      <SubscriberList
        initialSubscribers={subscribers || []}
        initialTotal={count || 0}
        initialPage={1}
        perPage={PER_PAGE}
      />
    </div>
  );
}
