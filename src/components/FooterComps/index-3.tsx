import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
    IoLocationSharp,
    IoCallSharp,
    IoArrowForwardOutline,
} from 'react-icons/io5';
import * as FaIcons from 'react-icons/fa';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';
import { buildSocialList } from './social-utils';

function FooterCompsThree() {
    const settings = useSettingsStore(useShallow((s) => ({
        loaded: s.loaded,
        address: s.address,
        phone: s.phone,
        logo_url: s.logo_url,
        social_facebook: s.social_facebook,
        social_twitter: s.social_twitter,
        social_instagram: s.social_instagram,
        social_pinterest: s.social_pinterest,
        social_tumblr: s.social_tumblr,
        copyright_text: s.copyright_text,
        footer_info_title: s.footer_info_title,
        footer_info_links_json: s.footer_info_links_json,
        footer_about_title: s.footer_about_title,
        footer_about_links_json: s.footer_about_links_json,
        footer_newsletter_title: s.footer_newsletter_title,
        footer_menu_links_json: s.footer_menu_links_json,
        footer_social_title: s.footer_social_title,
        footer_logo_alt: s.footer_logo_alt,
        footer_logo_path: s.footer_logo_path,
    })));
    const socialList = buildSocialList(settings);
    const infoList = useMemo(() => { try { return JSON.parse(settings.footer_info_links_json); } catch { return []; } }, [settings.footer_info_links_json]);
    const aboutList = useMemo(() => { try { return JSON.parse(settings.footer_about_links_json); } catch { return []; } }, [settings.footer_about_links_json]);
    const menuList = useMemo(() => { try { return JSON.parse(settings.footer_menu_links_json); } catch { return []; } }, [settings.footer_menu_links_json]);

    const footer = useRef<HTMLElement>(null);
    useEffect(() => {
        window.addEventListener('scroll', isSticky);

        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, []);

    const isSticky = () => {
        const scrollTop = window.scrollY;

        scrollTop < 0
            ? footer.current?.classList.add('is-sticky')
            : footer.current?.classList.remove('is-sticky');
    };
    return (
        <footer
            className="sm:bg-[#f4f5f7] sm:fixed sm:bottom-0 sm:left-0 sm:right-0 sm:w-full sm:z-[-1]"
            ref={footer}
        >
            <div className="footer-top xl:py-[115px] lg:py-[95px] md:py-[75px] py-[50px]">
                <div className="homecarousel-container md:mx-[100px] mx-[15px]">
                    <div className="grid grid-cols-12 sm:gap-x-[30px] max-md:gap-y-[30px]">
                        <div className="lg:col-span-3 sm:col-span-6 col-span-12 lg:self-center">
                            <div className="footer-widget">
                                <div className="footer-logo mb-[15px]">
                                    <Link href={settings.footer_logo_path}>
                                        <img
                                            src={settings.logo_url}
                                            alt={settings.footer_logo_alt}
                                            width={120}
                                            height={30}
                                            className={`transition-opacity duration-300 ${settings.loaded ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                    </Link>
                                </div>
                                <ul>
                                    <li className="flex items-center mb-[5px]">
                                        <IoLocationSharp />
                                        <span className="ml-[10px]">
                                            {settings.address}
                                        </span>
                                    </li>
                                    <li className="flex items-center">
                                        <IoCallSharp />
                                        <Link
                                            href={`tel:${settings.phone}`}
                                            className="font-normal hover:text-primary transition-all ml-[10px]"
                                        >
                                            {settings.phone}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="lg:col-span-3 sm:col-span-6 col-span-12">
                            <div className="footer-widget">
                                <h2 className="text-[18px] mb-[15px]">
                                    {settings.footer_info_title}
                                </h2>
                                <ul>
                                    {infoList?.map((item: any) => (
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
                        <div className="lg:col-span-2 sm:col-span-6 col-span-12">
                            <div className="footer-widget">
                                <h2 className="text-[18px] mb-[15px]">
                                    {settings.footer_about_title}
                                </h2>
                                <ul>
                                    {aboutList?.map((item: any) => (
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
                        <div className="lg:col-span-4 sm:col-span-6 col-span-12">
                            <div className="footer-widget lm:max-w-[410px] mx-auto">
                                <h2 className="text-[18px] mb-[15px]">
                                    {settings.footer_newsletter_title}
                                </h2>
                                <form>
                                    <div className="input-field relative ">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="您的電子郵件地址"
                                            className="bg-transparent border-0 border-b border-[rgba(0,0,0,.25)] outline-hidden w-full p-[10px_35px_10px_0] focus-visible:border-primary focus-visible:text-primary"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute top-1/2 -translate-y-1/2 right-0 text-[20px] text-[#99999] opacity-70"
                                        >
                                            <IoArrowForwardOutline />
                                        </button>
                                    </div>
                                </form>
                                <ul className="flex pt-[50px]">
                                    {menuList?.map((item: any) => (
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
            <div className="footer-copyright">
                <div className="homecarousel-container md:mx-[100px] mx-[15px]">
                    <div className="inner-container border-t border-[#ededed] pt-[35px] pb-[25px]">
                        <div className="grid grid-cols-12">
                            <div className="lg:col-span-6 col-span-12 max-md:order-2">
                                <span className="flex lg:justify-start justify-center items-center pt-[10px]">
                                    {(settings.copyright_text || '© {year} Helendo. 版權所有。')
                                        .replace('{year}', String(new Date().getFullYear()))}
                                </span>
                            </div>
                            <div className="lg:col-span-6 col-span-12 max-md:order-1">
                                <div className="social-link flex lg:justify-end justify-center">
                                    <h2 className="text-[16px] pr-[65px]">
                                        {settings.footer_social_title}
                                    </h2>
                                    <ul className="flex">
                                        {socialList?.map(
                                            (item: any) => {
                                                const Social =
                                                    FaIcons[item.socialIcon as keyof typeof FaIcons];
                                                return (
                                                    <li
                                                        className="mr-[25px] last:mr-0"
                                                        key={item.id}
                                                    >
                                                        <Link
                                                            href={item?.path}
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

export default FooterCompsThree;
