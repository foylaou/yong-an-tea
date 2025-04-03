"use client"
import Link from 'next/link';
import {
    IoLocationSharp,
    IoCallSharp,
    IoArrowForwardOutline,
} from 'react-icons/io5';
import * as FaIcons from 'react-icons/fa';

interface SocialItem {
    id: string | number;
    socialIcon: string;
    path: string;
}

interface InfoListItem {
    id: string | number;
    path: string;
    title: string;
}

interface MenuItem {
    id: string | number;
    path: string;
    title: string;
}

interface FooterItem {
    addressTitle?: string;
    address?: string;
    contactNumber?: string;
    contactNumberText?: string;
    socialList?: SocialItem[];
    infoTitle?: string;
    infoList?: InfoListItem[];
    aboutTitle?: string;
    aboutList?: InfoListItem[];
    newsletterTitle?: string;
    menuList?: MenuItem[];
    footerLogoPath?: string;
    footerLogo?: string;
    footerLogoAlt?: string;
    socialTitle?: string;
    copyrightLink?: string;
}

interface FooterCompsProps {
    footerContainer?: string;
    footerItems: FooterItem[];
}

export default function FooterComps({ footerContainer, footerItems }: FooterCompsProps) {
    return (
        <footer>
            <div className="footer-top xl:py-[115px] lg:py-[95px] md:py-[75px] py-[45px]">
                <div className={footerContainer}>
                    <div className="grid grid-cols-12 md:gap-y-0 gap-y-[30px]">
                        <div className="md:col-span-4 lm:col-span-6 col-span-12">
                            <div className="footer-widget">
                                <h2 className="text-[18px] mb-[15px]">
                                    {footerItems[0]?.addressTitle}
                                </h2>
                                <ul>
                                    <li className="flex items-center mb-[5px]">
                                        <span className="flex">
                                            <IoLocationSharp />
                                        </span>
                                        <span className="ml-[10px]">
                                            {footerItems[0]?.address}
                                        </span>
                                    </li>
                                    <li className="flex items-center">
                                        <span className="flex">
                                            <IoCallSharp />
                                        </span>
                                        <Link
                                            href={footerItems[0]?.contactNumber || '#'}
                                            className="font-normal hover:text-primary transition-all ml-[10px]"
                                        >
                                            {footerItems[0]?.contactNumberText}
                                        </Link>
                                    </li>
                                </ul>
                                <ul className="flex pt-[35px]">
                                    {footerItems[0]?.socialList?.map((item) => {
                                        const Social = FaIcons[item.socialIcon as keyof typeof FaIcons];
                                        return (
                                            <li
                                                className="mr-[25px] last:mr-0"
                                                key={item.id}
                                            >
                                                <Link
                                                    href={item?.path}
                                                    className="transition-all hover:text-primary"
                                                >
                                                    <span className="flex">
                                                        <Social />
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="md:col-span-3 lm:col-span-6 col-span-12">
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
                                                href={item?.path}
                                                className="font-normal transition-all hover:text-primary"
                                            >
                                                {item?.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:col-span-2 lm:col-span-6 col-span-12">
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
                                                href={item?.path}
                                                className="font-normal transition-all hover:text-primary"
                                            >
                                                {item?.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:col-span-3 lm:col-span-6 col-span-12">
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
                                            <span className="flex">
                                                <IoArrowForwardOutline />
                                            </span>
                                        </button>
                                    </div>
                                </form>
                                <ul className="flex pt-[50px]">
                                    {footerItems[0]?.menuList?.map((item) => (
                                        <li
                                            className="xl:mr-[30px] mr-[20px] last:mr-0"
                                            key={item.id}
                                        >
                                            <Link
                                                href={item?.path}
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
            <div className="footer-bottom">
                <div className={footerContainer}>
                    <div className="grid grid-cols-12 md:gap-y-0 gap-y-[20px] items-center">
                        <div className="md:col-span-4 col-span-12">
                            <ul className="flex md:justify-start justify-center">
                                {footerItems[0]?.menuList?.map((item) => (
                                    <li
                                        className="xl:mr-[30px] mr-[20px] last:mr-0"
                                        key={item.id}
                                    >
                                        <Link
                                            href={item?.path}
                                            className="font-normal transition-all hover:text-primary"
                                        >
                                            {item?.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-4 col-span-12">
                            <div className="footer-logo flex justify-center">
                                <Link href={footerItems[0]?.footerLogoPath || '#'}>
                                    <img
                                        src={footerItems[0]?.footerLogo}
                                        alt={footerItems[0]?.footerLogoAlt}
                                        width={120}
                                        height={30}
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="md:col-span-4 col-span-12">
                            <div className="social-link flex md:justify-end justify-center">
                                <h2 className="text-[16px] lg:pr-[65px] pr-[15px]">
                                    {footerItems[0]?.socialTitle}
                                </h2>
                                <ul className="flex">
                                    {footerItems[0]?.socialList?.map((item) => {
                                        const Social = FaIcons[item.socialIcon as keyof typeof FaIcons];
                                        return (
                                            <li
                                                className="xl:mr-[25px] mr-[20px] last:mr-0"
                                                key={item.id}
                                            >
                                                <Link
                                                    href={item?.path}
                                                    className="transition-all hover:text-primary"
                                                >
                                                    <span className="flex">
                                                        <Social />
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-copyright pt-[35px] pb-[25px]">
                <div className="container">
                    <div className="grid grid-cols-1">
                        <span className="flex justify-center items-center">
                            © {new Date().getFullYear()} Helendo.
                            <Link
                                href={footerItems[0]?.copyrightLink || '#'}
                                className="font-normal ml-[5px]"
                            >
                                All Rights Reserved.
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}