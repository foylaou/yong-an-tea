import { createClient } from '@/lib/supabase/server';
import { AdvancePaymentsTable } from '@/components/admin/nexus-finance/AdvancePaymentsTable';

const PER_PAGE = 20;

export default async function AdvancePaymentsPage() {
  const supabase = await createClient();

  const [{ data: advances, count }, { data: outstandingRows }] = await Promise.all([
    supabase
      .from('advance_payments')
      .select('*', { count: 'exact' })
      .order('advance_date', { ascending: false })
      .range(0, PER_PAGE - 1),
    supabase.from('advance_payments').select('amount').eq('status', 'outstanding'),
  ]);

  const outstandingTotal = (outstandingRows || []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0);

  return (
    <AdvancePaymentsTable
      initialAdvances={advances || []}
      initialTotal={count || 0}
      initialPage={1}
      perPage={PER_PAGE}
      initialOutstandingTotal={outstandingTotal}
    />
  );
}
