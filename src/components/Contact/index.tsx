import * as IoIcon from 'react-icons/io5';
import Link from 'next/link';
import GoogleMap from '../GoogleMap';
import { useSettingsStore } from '../../store/settings/settings-slice';

/** Map settings store social keys to IoIcon names */
const socialIconMap: { key: string; icon: string; label: string }[] = [
    { key: 'social_facebook', icon: 'IoLogoFacebook', label: 'Facebook' },
    { key: 'social_twitter', icon: 'IoLogoTwitter', label: 'Twitter' },
    { key: 'social_instagram', icon: 'IoLogoInstagram', label: 'Instagram' },
    { key: 'social_pinterest', icon: 'IoLogoPinterest', label: 'Pinterest' },
    { key: 'social_tumblr', icon: 'IoLogoTumblr', label: 'Tumblr' },
];

function ContactUs() {
    const settings = useSettingsStore();

    // Build the 4 info cards from settings store
    const infoCards = [
        {
            id: '01',
            infoIcon: 'IoStopwatchOutline',
            title: '營業時間',
            desc: settings.business_hours
                ? settings.business_hours.replace(/\n/g, ' <br/> ')
                : '',
        },
        {
            id: '02',
            infoIcon: 'IoCallOutline',
            title: '電話號碼',
            desc: settings.phone || '',
        },
        {
            id: '03',
            infoIcon: 'IoMailOpenOutline',
            title: '電子郵件',
            desc: settings.email || '',
        },
        {
            id: '04',
            infoIcon: 'IoLocationOutline',
            title: '門市地址',
            desc: settings.address
                ? settings.address.replace(/\n/g, ' <br/> ')
                : '',
        },
    ];

    // Build the right-side contact address from settings
    const contactAddress = [settings.address, settings.phone, settings.email]
        .filter(Boolean)
        .join(' <br/> ');

    // Build social links from settings store
    const socialList = socialIconMap
        .filter((s) => settings[s.key as keyof typeof settings])
        .map((s) => ({
            id: s.key,
            socialIcon: s.icon,
            path: settings[s.key as keyof typeof settings] as string,
        }));

    const singleField = `flex w-full`;
    const inputField = `border border-[#e8e8e8] focus-visible:outline-0 placeholder:text-[#7b7975] py-[10px] px-[20px] w-full h-[50px]`;
    const textareaField = `border border-[#e8e8e8] focus-visible:outline-0 placeholder:text-[#7b7975] p-[15px] w-full h-[150px]`;
    const secondaryButton =
        'flex bg-secondary text-white leading-[38px] text-[15px] h-[40px] px-[32px]';

    return (
        <>
            <div className="contact-info">
                <div className="container border-b border-[#ededed]">
                    <div className="grid grid-cols-12 max-md:gap-y-[30px] my-[60px]">
                        {infoCards.map((items) => {
                            const InfoIcon = IoIcon[items.infoIcon as keyof typeof IoIcon];
                            return (
                                <div
                                    className="lg:col-span-3 md:col-span-4 lm:col-span-6 col-span-12"
                                    key={items.id}
                                >
                                    <div className="single-contact-info">
                                        <div className="flex">
                                            <span className="icon text-[36px]">
                                                <InfoIcon />
                                            </span>
                                            <div className="content flex flex-col ml-[26px]">
                                                <h2 className="text-[18px] mb-[10px]">
                                                    {items.title}
                                                </h2>
                                                <p
                                                    dangerouslySetInnerHTML={{
                                                        __html: items.desc,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="contact pt-[65px] xl:pb-[120px] lg:pb-[100px] md:pb-[80px] pb-[50px]">
                <div className="container">
                    <div className="grid grid-cols-12 max-lm:gap-y-[30px]">
                        <div className="md:col-span-7 col-span-12 max-lm:order-2">
                            <div className="contact-form-wrap">
                                <h2 className="text-[24px] mb-[10px]">
                                    {settings.contact_form_title}
                                </h2>
                                <p className="mb-[30px]">
                                    {settings.contact_form_desc}
                                </p>
                                <form>
                                    <div className="group-field flex mb-[20px]">
                                        <div
                                            className={`${singleField} mr-[20px]`}
                                        >
                                            <input
                                                className={`${inputField}`}
                                                type="text"
                                                placeholder="姓名 *"
                                                required
                                            />
                                        </div>
                                        <div className={`${singleField}`}>
                                            <input
                                                className={`${inputField}`}
                                                type="email"
                                                placeholder="電子郵件 *"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className={`${singleField}  mb-[20px]`}
                                    >
                                        <input
                                            className={`${inputField}`}
                                            type="text"
                                            placeholder="主旨 *"
                                            required
                                        />
                                    </div>
                                    <div className={`${singleField} mb-[30px]`}>
                                        <textarea
                                            className={`${textareaField}`}
                                            placeholder="請描述您的需求。"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className={`${secondaryButton}`}
                                    >
                                        送出
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="md:col-span-5 col-span-12 lg:pl-[120px] md:pl-[30px] max-lm:order-1">
                            <div className="contact-info">
                                <h2 className="text-[24px] mb-[10px]">
                                    {settings.contact_info_title}
                                </h2>
                                <p>{settings.contact_info_desc}</p>
                                <p
                                    className="mt-[25px]"
                                    dangerouslySetInnerHTML={{
                                        __html: contactAddress,
                                    }}
                                />
                                <div className="social-link flex items-center pt-[60px]">
                                    <h2 className="text-[16px] font-normal lg:pr-[65px] pr-[45px]">
                                        {settings.contact_social_title}
                                    </h2>
                                    <ul className="flex">
                                        {socialList.map((items) => {
                                            const Social =
                                                IoIcon[items.socialIcon as keyof typeof IoIcon];
                                            return (
                                                <li
                                                    className="mr-[15px] last:mr-0"
                                                    key={items.id}
                                                >
                                                    <Link
                                                        href={items.path}
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
                </div>
            </div>
            <div className="google-map">
                <GoogleMap />
            </div>
        </>
    );
}

export default ContactUs;
