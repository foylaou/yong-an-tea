import '@/styles/admin-globals.css';

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
      <body className="font-roboto antialiased">{children}</body>
    </html>
  );
}
