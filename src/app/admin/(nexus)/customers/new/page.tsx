import { CustomerForm } from '@/components/admin/nexus-customers/CustomerForm';
import { PageTitle } from '@/components/admin/nexus-layout/PageTitle';

export default function NewCustomerPage() {
  return (
    <div>
      <PageTitle title="新增客戶" />
      <CustomerForm />
    </div>
  );
}
