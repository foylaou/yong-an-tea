import { createClient } from '@/lib/supabase/server';
import { SubscriberList } from '@/components/admin/nexus-newsletter/SubscriberList';

const PER_PAGE = 20;

export default async function SubscribersPage() {
  const supabase = await createClient();

  const { data: subscribers, count } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return <SubscriberList initialSubscribers={subscribers || []} initialTotal={count || 0} initialPage={1} perPage={PER_PAGE} />;
}
