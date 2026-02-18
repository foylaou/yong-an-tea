import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NewsletterForm from '@/components/admin/newsletter/NewsletterForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditNewsletterPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('id, subject, content_html, status')
    .eq('id', id)
    .single();

  if (error || !newsletter || newsletter.status !== 'draft') {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">編輯電子報</h1>
      </div>
      <NewsletterForm
        initialData={{
          id: newsletter.id,
          subject: newsletter.subject,
          content_html: newsletter.content_html,
        }}
      />
    </div>
  );
}
