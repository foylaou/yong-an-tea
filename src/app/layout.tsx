import "./globals.css";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-tw">
    <head>
      <title>永安茶園</title>
      <link rel="icon" href="/favicon.ico"  sizes="64x64"/>

    </head>
    <body>
        {children}
      </body>

    </html>
  );
}
