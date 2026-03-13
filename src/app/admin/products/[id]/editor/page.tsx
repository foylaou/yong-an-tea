import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PuckEditorPage from '@/components/admin/products/PuckEditorPage';

export default async function ProductEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') redirect('/');

  const { data: product } = await supabase
    .from('products')
    .select('id, title, puck_data')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <PuckEditorPage
      productId={product.id}
      productTitle={product.title}
      initialData={product.puck_data}
    />
  );
}
