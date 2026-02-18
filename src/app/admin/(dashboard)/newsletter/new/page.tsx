import NewsletterForm from '@/components/admin/newsletter/NewsletterForm';

export default function NewNewsletterPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">撰寫電子報</h1>
      </div>
      <NewsletterForm />
    </div>
  );
}
