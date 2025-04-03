import "./globals.css";

import FooterCompsThree from "@/components/helendo/FooterComps/FooterCompsThree";
import React from "react";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerItems = [
    {
      addressTitle: "永安茶園",
      address: "台灣台東縣鹿野鄉高台路39號",
      contactNumber: "tel:+886-089550818",
      contactNumberText: "(089) 550-818",
      footerLogoPath: "/",
      footerLogo: "/網頁首頁.svg",
      footerLogoAlt: "永安茶園 Logo",
      socialTitle: "追蹤我們",
      socialList: [
        {
          id: 1,
          socialIcon: "FaFacebook",
          path: "https://facebook.com/youraccount"
        },
        {
          id: 2,
          socialIcon: "FaInstagram",
          path: "https://instagram.com/youraccount"
        }
      ],
      infoTitle: "快速連結",
      infoList: [
        {
          id: 1,
          title: "關於我們",
          path: "/about"
        },
        {
          id: 2,
          title: "最新消息",
          path: "/news"
        }
      ],
      aboutTitle: "服務",
      aboutList: [
        {
          id: 1,
          title: "線上商店",
          path: "/shop"
        },
        {
          id: 2,
          title: "會員專區",
          path: "/member"
        }
      ],
      newsletterTitle: "訂閱電子報",
      menuList: [
        {
          id: 1,
          title: "隱私政策",
          path: "/privacy"
        },
        {
          id: 2,
          title: "服務條款",
          path: "/terms"
        }
      ],
      copyrightLink: "/"
    }
  ];

  return (
    <html lang="zh-tw">
    <head>
      <title>永安茶園</title>
      <link rel="icon" href="/favicon.ico"  sizes="64x64"/>

    </head>
    <body>
        {children}
        <FooterCompsThree footerItems={footerItems}/>
      </body>

    </html>
  );
}
