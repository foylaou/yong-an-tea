import { createClient } from '@/lib/supabase/server';
import { FixedExpensesTable } from '@/components/admin/nexus-finance/FixedExpensesTable';

const PER_PAGE = 20;

export default async function ExpensesPage() {
  const supabase = await createClient();

  const { data: expenses, count } = await supabase
    .from('fixed_expenses')
    .select('*', { count: 'exact' })
    .order('month', { ascending: false })
    .order('created_at', { ascending: false })
    .range(0, PER_PAGE - 1);

  return (
    <FixedExpensesTable initialExpenses={expenses || []} initialTotal={count || 0} initialPage={1} perPage={PER_PAGE} />
  );
}
