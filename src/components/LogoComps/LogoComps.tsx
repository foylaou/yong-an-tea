"use client";
import Link from 'next/link';
import {JSX} from "react";

import Image from "next/image";
import {HeaderItem} from "@/components/HeaderComps/MenuType";


/**
 * LogoComps 組件參數
 *
 * @interface LogoCompsProps
 * @property {any[]} headerItems 頁首資料（包含 logo）
 * @property {string} headerLogoCName 外層容器的 class 名稱
 * @property {string} logoPath 點擊後導向的路徑
 */
interface LogoCompsProps {
    headerItems: HeaderItem[];
    headerLogoCName: string;
    logoPath: string;
}
/**
 * LogoComps - 頁首 Logo 元件
 *
 * @param {LogoCompsProps} props 組件參數
 * @returns {JSX.Element} Logo 組件
 */
export default function LogoComps({

                                      headerLogoCName,
                                      logoPath,
                                  }: LogoCompsProps): JSX.Element {
    return (
        <div className={headerLogoCName}>
            <Link href={logoPath} className="block">
                <Image
                    src={"圓形LOGO（白背景）.svg"}
                    alt={'網站 Logo'}
                    width={100}
                    height={20}
                />
            </Link>
        </div>
    );
}
