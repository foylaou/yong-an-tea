import "./globals.css";
import "@/styles/components.css"
import FooterCompsThree from "@/components/FooterComps/FooterCompsThree";
import type { Metadata } from "next";
import {JSX, ReactNode} from "react";
import {Noto_Sans_TC, Roboto} from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
/**
 * 預設網站 SEO 資訊
 */
const notoSansTC = Noto_Sans_TC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});
export const metadata: Metadata = {
  title: "永安茶園",
  description: "位於台東鹿野的永安茶園，提供優質紅烏龍、茶葉禮盒、茶文化體驗。",
  keywords: ["永安茶園", "台東紅烏龍", "台灣茶", "茶葉禮盒"],
  metadataBase: new URL("https://yong-an-tea.vercel.app"),
  openGraph: {
    title: "永安茶園",
    description: "品味自然好茶，傳承鹿野風土。",
    url: "https://yong-an-tea.vercel.app",
    siteName: "永安茶園 YongAn Tea",
    images: [
      {
        url: "/圓形LOGO（白背景）.svg",
        width: 1200,
        height: 630,
        alt: "永安茶園 - 品味自然好茶",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * 根佈局
 *
 * @param {ReactNode} children 所有子頁面內容
 */
export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  const footerItems = [
    {
      addressTitle: "永安茶園",
      address: "台灣台東縣鹿野鄉高台路39號",
      contactNumber: "tel:+886-089550818",
      contactNumberText: "(089) 550-818",
      footerLogoPath: "/",
      footerLogo: "/footerlogo.svg",
      footerLogoAlt: "永安茶園 Logo",
      socialTitle: "追蹤我們",
      socialList: [
        {
          id: 1,
          socialIcon: "FaFacebook",
          path: "https://www.facebook.com/yongan.teagarden",
        },
        {
          id: 2,
          socialIcon: "FaInstagram",
          path: "https://www.instagram.com/yongantea/",
        },
      ],
      infoTitle: "快速連結",
      infoList: [
        {id: 1, title: "關於我們", path: "/about"},
        {id: 2, title: "最新消息", path: "/news"},
      ],
      aboutTitle: "服務",
      aboutList: [
        {id: 1, title: "線上商店", path: "/products"},
        {id: 2, title: "會員專區", path: "/member"},
      ],
      newsletterTitle: "訂閱電子報",
      menuList: [
        {id: 1, title: "隱私政策", path: "/privacy"},
        {id: 2, title: "服務條款", path: "/terms"},
      ],
      copyrightLink: "/",
    },
  ];

  return (
      <html lang="zh-tw" className={`${notoSansTC.variable} ${roboto.variable}`}>
      <head>
        <meta charSet="UTF-8"/>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=5"
        />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"/>

        <title>永安茶園</title>
      </head>
      <body className="font-sans">
      <main>{children}</main>
      <Analytics/>
      <SpeedInsights/>
      <FooterCompsThree footerItems={footerItems}/>
      </body>
      </html>
  );
}
