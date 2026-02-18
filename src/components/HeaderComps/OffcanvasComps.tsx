import Link from 'next/link';
import * as FaIcons from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import OffcanvasMenu from './OffcanvasMenu';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';
import { buildSocialList } from '../FooterComps/social-utils';

interface OffcanvasCompsProps {
    offcanvas: boolean;
    showOffcanvas: () => void;
}

function OffcanvasComps({ offcanvas, showOffcanvas }: OffcanvasCompsProps) {
    const settings = useSettingsStore(useShallow((s) => ({
        address: s.address,
        phone: s.phone,
        email: s.email,
        social_facebook: s.social_facebook,
        social_twitter: s.social_twitter,
        social_instagram: s.social_instagram,
        social_pinterest: s.social_pinterest,
        social_tumblr: s.social_tumblr,
        header_contact_title: s.header_contact_title,
        header_social_title: s.header_social_title,
    })));
    const contactInfo = [settings.address, settings.phone, settings.email].filter(Boolean).join('<br />');
    const socialList = buildSocialList(settings);

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
                <OffcanvasMenu />
                <div className="offcanvas-contact-info pt-[60px]">
                    <h3 className="text-[16px]">
                        {settings.header_contact_title}
                    </h3>
                    {contactInfo && (
                        <p
                            className="text-[#666666] pt-[20px]"
                            dangerouslySetInnerHTML={{
                                __html: contactInfo,
                            }}
                        />
                    )}
                    <div className="offcanvas-social-link flex justify-between items-center pt-[55px]">
                        <h3 className="text-[16px]">
                            {settings.header_social_title}
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
