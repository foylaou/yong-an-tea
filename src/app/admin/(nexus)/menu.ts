import { ISidebarMenuItem } from '@/components/admin/nexus-layout/SidebarMenuItem';

export const adminMenuItems: ISidebarMenuItem[] = [
  { id: 'dashboard', label: '儀表板', icon: 'lucide--layout-dashboard', url: '/admin' },
  { id: 'orders', label: '訂單管理', icon: 'lucide--shopping-cart', url: '/admin/orders' },
  { id: 'customers', label: '客戶管理', icon: 'lucide--contact', url: '/admin/customers' },
  { id: 'products', label: '商品管理', icon: 'lucide--package', url: '/admin/products' },
  { id: 'reviews', label: '評價管理', icon: 'lucide--star', url: '/admin/reviews' },
  { id: 'analytics', label: '銷售分析', icon: 'lucide--bar-chart-3', url: '/admin/analytics' },
  { id: 'coupons', label: '優惠券', icon: 'lucide--ticket', url: '/admin/coupons' },
  { id: 'categories', label: '商品分類', icon: 'lucide--folder', url: '/admin/categories' },
  { id: 'blogs', label: '部落格管理', icon: 'lucide--newspaper', url: '/admin/blogs' },
  { id: 'users', label: '管理員', icon: 'lucide--shield', url: '/admin/users' },
  { id: 'newsletter', label: '電子報', icon: 'lucide--mail', url: '/admin/newsletter' },
  { id: 'seo', label: 'SEO 管理', icon: 'lucide--search', url: '/admin/seo' },
  { id: 'settings', label: '系統設定', icon: 'lucide--settings', url: '/admin/settings' },
];
