import { NewsletterForm } from '@/components/admin/nexus-newsletter/NewsletterForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default function NewNewsletterPage() {
  return (
    <div>
      <PageTitle title="撰寫電子報" />
      <NewsletterForm />
    </div>
  );
}
