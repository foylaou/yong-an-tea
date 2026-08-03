import { createClient } from '@/lib/supabase/server';
import { NewsletterList } from '@/components/admin/nexus-newsletter/NewsletterList';

const PER_PAGE = 20;

export default async function NewsletterPage() {
  const supabase = await createClient();

  const { data: newsletters, count } = await supabase
    .from('newsletters')
    .select('id, subject, status, sent_count, sent_at, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return <NewsletterList initialNewsletters={newsletters || []} initialTotal={count || 0} initialPage={1} perPage={PER_PAGE} />;
}
