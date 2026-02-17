import { IoArrowForwardOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface NewsletterCompsThreeProps {
    newsletterCName: string;
    sectionTitle: string;
    sectionDesc: string;
    containerCName: string;
}

function NewsletterCompsThree({
    newsletterCName,
    sectionTitle,
    sectionDesc,
    containerCName,
}: NewsletterCompsThreeProps) {
    const emailPlaceholder = useSettingsStore((s) => s.email_placeholder);

    return (
        <div className={newsletterCName}>
            <div className={containerCName}>
                <div className="grid grid-cols-12 md:gap-x-[30px]">
                    <div className="md:col-span-6 col-span-12">
                        <div className="section-wrap pb-[10px]">
                            <h2 className="title md:text-[36px] text-[30px] mb-[30px]">
                                {sectionTitle}
                            </h2>
                            <p className="desc xl:w-[560px]">{sectionDesc}</p>
                        </div>
                    </div>
                    <div className="md:col-span-6 col-span-12 self-center">
                        <form className="newsletter-form relative">
                            <input
                                className="w-full h-[40px] border-b border-[#dddddd] p-[10px_50px_10px_0] focus:outline-hidden focus:border-b-primary focus:text-primary"
                                type="email"
                                placeholder={emailPlaceholder}
                                required
                            />
                            <button
                                type="submit"
                                className="light-stroke text-[18px] absolute top-0 right-[15px] h-[40px]"
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

export default NewsletterCompsThree;
