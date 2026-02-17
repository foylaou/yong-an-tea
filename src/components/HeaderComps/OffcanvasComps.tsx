import Link from 'next/link';
import * as FaIcons from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import OffcanvasMenu from './OffcanvasMenu';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';
import { buildSocialList } from '../FooterComps/social-utils';
import type { MarkdownItem } from '../../types';

interface OffcanvasCompsProps {
    headerItems: MarkdownItem[];
    offcanvas: boolean;
    showOffcanvas: () => void;
}

function OffcanvasComps({ headerItems, offcanvas, showOffcanvas }: OffcanvasCompsProps) {
    const settings = useSettingsStore(useShallow((s) => ({
        loaded: s.loaded,
        address: s.address,
        phone: s.phone,
        email: s.email,
        social_facebook: s.social_facebook,
        social_twitter: s.social_twitter,
        social_instagram: s.social_instagram,
        social_pinterest: s.social_pinterest,
        social_tumblr: s.social_tumblr,
    })));
    const contactInfo = settings.loaded && (settings.address || settings.phone || settings.email)
        ? [settings.address, settings.phone, settings.email].filter(Boolean).join('<br />')
        : headerItems[0]?.contactInfo;
    const socialList = settings.loaded ? buildSocialList(settings) : headerItems[0]?.socialList;

    return (
        <div
            className={offcanvas ? 'offcanvas-menu active' : 'offcanvas-menu'}
            onClick={showOffcanvas}
        >
            <div
                className="offcanvas-menu-inner overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="offcanvas-top flex">
                    <button
                        type="button"
                        className="offcanvas-close-btn text-[32px]"
                        aria-label="Right Align"
                    >
                        <IoCloseOutline onClick={showOffcanvas} />
                    </button>
                </div>
                {((headerItems[0]?.languageList?.length ?? 0) > 1 || (headerItems[0]?.currencyList?.length ?? 0) > 1) && (
                <div className="offcanvas-setting grid grid-cols-2 pt-[40px]">
                    {(headerItems[0]?.languageList?.length ?? 0) > 1 && (
                    <div className="language-widget">
                        <h3 className="text-[16px] mb-[15px]">
                            {headerItems[0]?.languageTitle}
                        </h3>
                        <ul>
                            {headerItems[0]?.languageList?.map((items) => (
                                <li
                                    className="mb-[10px] last:mb-0"
                                    key={items.id}
                                >
                                    <Link
                                        href={items.path || '/'}
                                        className="text-[#999999] font-normal transition-all hover:text-primary block"
                                    >
                                        {items.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    )}
                    {(headerItems[0]?.currencyList?.length ?? 0) > 1 && (
                    <div className="currency-widget">
                        <h3 className="text-[16px] mb-[10px]">
                            {headerItems[0]?.currencyTitle}
                        </h3>
                        <ul>
                            {headerItems[0]?.currencyList?.map((items) => (
                                <li
                                    className="mb-[15px] last:mb-0"
                                    key={items.id}
                                >
                                    <Link
                                        href={items.path || '/'}
                                        className="text-[#999999] font-normal transition-all hover:text-primary block"
                                    >
                                        {items.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    )}
                </div>
                )}
                <OffcanvasMenu />
                <div className="offcanvas-contact-info pt-[60px]">
                    <h3 className="text-[16px]">
                        {headerItems[0]?.contactInfoTitle}
                    </h3>
                    <p
                        className="text-[#666666] pt-[20px]"
                        dangerouslySetInnerHTML={{
                            __html: contactInfo,
                        }}
                    />
                    <div className="offcanvas-social-link flex justify-between items-center pt-[55px]">
                        <h3 className="text-[16px]">
                            {headerItems[0]?.socialTitle}
                        </h3>
                        <ul className="flex">
                            {socialList?.map((item: any) => {
                                const Social = FaIcons[item.socialIcon as keyof typeof FaIcons];
                                return (
                                    <li
                                        className="mr-[25px] last:mr-0"
                                        key={item.id}
                                    >
                                        <Link
                                            href={item?.path || '/'}
                                            className="transition-all hover:text-primary"
                                        >
                                            <Social />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OffcanvasComps;
