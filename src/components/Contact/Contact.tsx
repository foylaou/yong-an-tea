import * as IoIcon from 'react-icons/io5';
import Link from 'next/link';
import GoogleMap from "@/components/GoogleMap/GoogleMap";


interface ContactInfo {
    id: string | number;
    infoIcon: string;
    title: string;
    desc: string;
}

interface SocialItem {
    id: string | number;
    socialIcon: string;
    path: string;
}

interface ContactItem {
    singleContactInfo?: ContactInfo[];
    formTitle?: string;
    formDesc?: string;
    infoTitle?: string;
    infoDesc?: string;
    contactAddress?: string;
    socialTitle?: string;
    socialList?: SocialItem[];
}

interface ContactUsProps {
    contactItems: ContactItem[];
}

export default function ContactUs({ contactItems }: ContactUsProps) {
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
                        {contactItems[0]?.singleContactInfo?.map((items) => {
                            const InfoIcon = IoIcon[items.infoIcon as keyof typeof IoIcon];
                            return (
                                <div
                                    className="lg:col-span-3 md:col-span-4 lm:col-span-6 col-span-12"
                                    key={items.id}
                                >
                                    <div className="single-contact-info">
                                        <div className="flex">
                                            <span className="icon text-[36px]">
                                                <span className="flex">
                                                    <InfoIcon />
                                                </span>
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
                                    {contactItems[0]?.formTitle}
                                </h2>
                                <p className="mb-[30px]">
                                    {contactItems[0]?.formDesc}
                                </p>
                                <form>
                                    <div className="group-field flex mb-[20px]">
                                        <div
                                            className={`${singleField} mr-[20px]`}
                                        >
                                            <input
                                                className={`${inputField}`}
                                                type="text"
                                                placeholder="Name *"
                                                required
                                            />
                                        </div>
                                        <div className={`${singleField}`}>
                                            <input
                                                className={`${inputField}`}
                                                type="email"
                                                placeholder="Email *"
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
                                            placeholder="Subject *"
                                            required
                                        />
                                    </div>
                                    <div className={`${singleField} mb-[30px]`}>
                                        <textarea
                                            className={`${textareaField}`}
                                            placeholder="Please describe what you need."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className={`${secondaryButton}`}
                                    >
                                        Submit
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="md:col-span-5 col-span-12 lg:pl-[120px] md:pl-[30px] max-lm:order-1">
                            <div className="contact-info">
                                <h2 className="text-[24px] mb-[10px]">
                                    {contactItems[0]?.infoTitle}
                                </h2>
                                <p>{contactItems[0]?.infoDesc}</p>
                                <p
                                    className="mt-[25px]"
                                    dangerouslySetInnerHTML={{
                                        __html: contactItems[0]?.contactAddress || '',
                                    }}
                                />
                                <div className="social-link flex items-center pt-[60px]">
                                    <h2 className="text-[16px] font-normal lg:pr-[65px] pr-[45px]">
                                        {contactItems[0]?.socialTitle}
                                    </h2>
                                    <ul className="flex">
                                        {contactItems[0]?.socialList?.map(
                                            (items) => {
                                                const Social =
                                                    IoIcon[items.socialIcon as keyof typeof IoIcon];
                                                return (
                                                    <li
                                                        className="mr-[15px] last:mr-0"
                                                        key={items.id}
                                                    >
                                                        <Link
                                                            href={items?.path}
                                                            className="transition-all hover:text-primary"
                                                        >
                                                            <span className="flex">
                                                                <Social />
                                                            </span>
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
            <div className="google-map">
                <GoogleMap />
            </div>
        </>
    );
}