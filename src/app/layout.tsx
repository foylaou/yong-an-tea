import '@/styles/admin-globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
export const metadata = {
  title: '永安茶園 後台管理',
  description: '永安茶園 電商後台管理系統',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="zh-TW" className="group/html">
          <Analytics />
          <SpeedInsights />
          <body className="font-roboto antialiased">{children}</body>
      </html>
  );
}
