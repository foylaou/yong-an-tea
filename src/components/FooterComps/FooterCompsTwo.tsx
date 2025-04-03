"use client"
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';
import * as FaIcons from 'react-icons/fa';

// 定義 footerItems 的類型介面
interface FooterItem {
    id: number;
    title?: string;
    path?: string;
    socialIcon?: string;
}

interface FooterItemSection {
    infoTitle?: string;
    infoList?: FooterItem[];
    aboutTitle?: string;
    aboutList?: FooterItem[];
    socialMediaTitle?: string;
    socialMediaList?: FooterItem[];
    newsletterTitle?: string;
    menuList?: FooterItem[];
    socialTitle?: string;
    socialList?: FooterItem[];
    copyrightLink?: string;
}

// 定義組件參數介面
interface FooterCompsTwoProps {
    footerItems: FooterItemSection[];
}

// 使用 React.FC 定義函數組件
export default function FooterCompsTwo({ footerItems }: FooterCompsTwoProps) {
    return (
        <footer>
            <div className="footer-top lg:py-[95px] md:py-[75px] py-[45px]">
                <div className="homebox-container xl:mx-[100px] mx-[30px]">
                    <div className="grid grid-cols-12 max-lm:gap-y-[25px]">
                        <div className="md:col-span-3 sm:col-span-6 col-span-12">
                            <div className="footer-widget">
                                <h2 className="text-[18px] mb-[15px]">
                                    {footerItems[0]?.infoTitle}
                                </h2>
                                <ul>
                                    {footerItems[0]?.infoList?.map((item) => (
                                        <li
                                            className="mb-[5px] last:mb-0"
                                            key={item.id}
                                        >
                                            <Link
                                                href={item?.path || ''}
                                                className="font-normal transition-all hover:text-primary"
                                            >
                                                {item?.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:col-span-3 sm:col-span-6 col-span-12">
                            <div className="footer-widget">
                                <h2 className="text-[18px] mb-[15px]">
                                    {footerItems[0]?.aboutTitle}
                                </h2>
                                <ul>
                                    {footerItems[0]?.aboutList?.map((item) => (
                                        <li
                                            className="mb-[5px] last:mb-0"
                                            key={item.id}
                                        >
                                            <Link
                                                href={item?.path || ''}
                                                className="font-normal transition-all hover:text-primary"
                                            >
                                                {item?.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:col-span-3 sm:col-span-6 col-span-12">
                            <div className="footer-widget">
                                <h2 className="text-[18px] mb-[15px]">
                                    {footerItems[0]?.socialMediaTitle}
                                </h2>
                                <ul>
                                    {footerItems[0]?.socialMediaList?.map(
                                        (item) => (
                                            <li
                                                className="mb-[5px] last:mb-0"
                                                key={item.id}
                                            >
                                                <Link
                                                    href={item?.path || ''}
                                                    className="font-normal transition-all hover:text-primary"
                                                >
                                                    {item?.title}
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="md:col-span-3 sm:col-span-6 col-span-12">
                            <div className="footer-widget">
                                <h2 className="text-[18px] mb-[15px]">
                                    {footerItems[0]?.newsletterTitle}
                                </h2>
                                <form>
                                    <div className="input-field relative max-w-[270px]">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Your email address"
                                            className="bg-transparent border-0 border-b border-[rgba(0,0,0,.25)] outline-none w-full p-[10px_35px_10px_0] focus-visible:border-primary focus-visible:text-primary"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute top-1/2 -translate-y-1/2 right-0 text-[20px] text-[#99999] opacity-70"
                                        >
                                            <IoArrowForwardOutline />
                                        </button>
                                    </div>
                                </form>
                                <ul className="flex flex-wrap pt-[50px]">
                                    {footerItems[0]?.menuList?.map((item) => (
                                        <li
                                            className="xl:mr-[30px] mr-[15px] last:mr-0"
                                            key={item.id}
                                        >
                                            <Link
                                                href={item?.path || ''}
                                                className="font-normal transition-all hover:text-primary"
                                            >
                                                {item?.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-copyright">
                <div className="homebox-container xl:mx-[100px] mx-[30px]">
                    <div className="inner-container border-t border-[#ededed] pt-[35px] pb-[25px]">
                        <div className="grid grid-cols-12">
                            <div className="md:col-span-6 col-span-12 max-lm:order-2">
                                <span className="sm:flex md:justify-start justify-center items-center">
                                    © {new Date().getFullYear()} Helendo.
                                    <Link
                                        href={footerItems[0]?.copyrightLink || ''}
                                        className="font-normal ml-[5px] transition-all hover:text-primary"
                                    >
                                        All Rights Reserved.
                                    </Link>
                                </span>
                            </div>
                            <div className="md:col-span-6 col-span-12 max-lm:order-1">
                                <div className="social-link flex md:justify-end justify-center max-lm:mb-[10px]">
                                    <h2 className="text-[16px] pr-[65px]">
                                        {footerItems[0]?.socialTitle}
                                    </h2>
                                    <ul className="flex">
                                        {footerItems[0]?.socialList?.map(
                                            (item) => {
                                                const Social =
                                                    FaIcons[item.socialIcon as keyof typeof FaIcons];
                                                return (
                                                    <li
                                                        className="mr-[25px] last:mr-0"
                                                        key={item.id}
                                                    >
                                                        <Link
                                                            href={item?.path || ''}
                                                            className="transition-all hover:text-primary"
                                                        >
                                                            <Social />
                                                        </Link>
                                                    </li>
                                                );
                                            }
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}