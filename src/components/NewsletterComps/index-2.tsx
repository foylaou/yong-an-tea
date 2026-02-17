import { IoArrowForwardOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface NewsletterCompsTwoProps {
    newsletterCName: string;
    sectionTitle: string;
    sectionDesc: string;
    containerCName: string;
}

function NewsletterCompsTwo({
    newsletterCName,
    sectionTitle,
    sectionDesc,
    containerCName,
}: NewsletterCompsTwoProps) {
    const emailPlaceholder = useSettingsStore((s) => s.email_placeholder);

    return (
        <div className={newsletterCName}>
            <div className={containerCName}>
                <div className="grid grid-cols-12">
                    <div className="lg:col-span-6 md:col-span-5 col-span-12">
                        <div className="section-wrap md:pb-[10px] pb-[40px]">
                            <h2 className="title text-[26px]">
                                {sectionTitle}
                            </h2>
                            <p className="desc">{sectionDesc}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-6 md:col-span-7 col-span-12 self-center">
                        <form className="newsletter-form relative">
                            <input
                                className="w-full bg-white h-[54px] p-[10px_80px_10px_20px] focus:outline-hidden"
                                type="email"
                                placeholder={emailPlaceholder}
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

export default NewsletterCompsTwo;
