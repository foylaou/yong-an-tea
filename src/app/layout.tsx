import '@/styles/admin-globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
export const metadata = {
  title: '永安茶園 後台管理',
  description: '永安茶園 電商後台管理系統',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="zh-TW">
          <Analytics />
          <SpeedInsights />
          <body className="font-roboto antialiased">{children}</body>
      </html>
  );
}
