"use client";
import { IoArrowForwardOutline } from 'react-icons/io5';
import {JSX} from "react";

/**
 * NewsletterCompsTwo 元件的參數
 *
 * @interface NewsletterCompsTwoProps
 * @property {string} newsletterCName 外層容器的 class 名稱
 * @property {string} containerCName 包裹 container 的 class 名稱
 * @property {string} sectionTitle 標題文字
 * @property {string} sectionDesc 描述文字
 */
interface NewsletterCompsTwoProps {
    newsletterCName: string;
    containerCName: string;
    sectionTitle: string;
    sectionDesc: string;
}

/**
 * NewsletterCompsTwo - 簡約風格訂閱電子報元件
 *
 * @param {NewsletterCompsTwoProps} props 元件參數
 * @returns {JSX.Element} 訂閱區塊
 */
export default function NewsletterCompsTwo({
                                               newsletterCName,
                                               containerCName,
                                               sectionTitle,
                                               sectionDesc,
                                           }: NewsletterCompsTwoProps): JSX.Element {
    return (
        <div className={newsletterCName}>
            <div className={containerCName}>
                <div className="grid grid-cols-12">
                    <div className="lg:col-span-6 md:col-span-5 col-span-12">
                        <div className="section-wrap md:pb-[10px] pb-[40px]">
                            <h2 className="title text-[26px]">{sectionTitle}</h2>
                            <p className="desc">{sectionDesc}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-6 md:col-span-7 col-span-12 self-center">
                        <form className="newsletter-form relative">
                            <input
                                className="w-full bg-white h-[54px] p-[10px_80px_10px_20px] focus:outline-none"
                                type="email"
                                placeholder="Your email address"
                                required
                            />
                            <button
                                type="submit"
                                className="absolute top-0 right-[15px] h-[54px] px-[30px]"
                            >
                                <IoArrowForwardOutline />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
