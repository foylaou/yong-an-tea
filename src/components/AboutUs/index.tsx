import * as IoIcon from 'react-icons/io5';
import ProgressBar from '../ProgressBar';
import VideoModal from '../VideoModal';
import { MarkdownItem } from '../../types';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface AboutUsProps {
    aboutItems: MarkdownItem[];
}

function parseJSON<T>(raw: string | undefined, fallback: T): T {
    try {
        if (raw) return JSON.parse(raw);
        return fallback;
    } catch {
        return fallback;
    }
}

function AboutUs({ aboutItems }: AboutUsProps) {
    const loaded = useSettingsStore((s) => s.loaded);
    const aboutVideoUrl = useSettingsStore((s) => s.about_video_url);
    const aboutVideoBanner = useSettingsStore((s) => s.about_video_banner);
    const aboutVideoBannerAlt = useSettingsStore((s) => s.about_video_banner_alt);
    const aboutSupportInfoJson = useSettingsStore((s) => s.about_support_info_json);
    const aboutPerfectionTitle = useSettingsStore((s) => s.about_perfection_title);
    const aboutPerfectionDesc = useSettingsStore((s) => s.about_perfection_desc);
    const aboutProgressJson = useSettingsStore((s) => s.about_progress_json);
    const aboutBannerAlt = useSettingsStore((s) => s.about_banner_alt);
    const aboutBannerOne = useSettingsStore((s) => s.about_banner_one);
    const aboutBannerTwo = useSettingsStore((s) => s.about_banner_two);
    const aboutBannerThree = useSettingsStore((s) => s.about_banner_three);
    const aboutBannerFour = useSettingsStore((s) => s.about_banner_four);
    const aboutBannerFive = useSettingsStore((s) => s.about_banner_five);
    const aboutAddrTitleOne = useSettingsStore((s) => s.about_address_title_one);
    const aboutAddrDescOne = useSettingsStore((s) => s.about_address_desc_one);
    const aboutAddrTitleTwo = useSettingsStore((s) => s.about_address_title_two);
    const aboutAddrDescTwo = useSettingsStore((s) => s.about_address_desc_two);

    const md = aboutItems[0];

    // Video banner
    const videoBanner = (loaded && aboutVideoBanner) || md?.videoBanner;
    const videoBannerAlt = (loaded && aboutVideoBannerAlt) || md?.videoBannerAlt;
    const videoUrl = (loaded && aboutVideoUrl) || 'https://www.youtube.com/embed/fkoEj95puX0';

    // Support info
    const supportInfo = loaded
        ? parseJSON(aboutSupportInfoJson, md?.singleSupportInfo || [])
        : md?.singleSupportInfo || [];

    // Perfection
    const perfTitle = (loaded && aboutPerfectionTitle) || md?.perfectionTitle;
    const perfDesc = (loaded && aboutPerfectionDesc) || md?.perfectionDesc;
    const progressBars = loaded
        ? parseJSON(aboutProgressJson, [
              { title: '創意', progressText: '82%' },
              { title: '行銷', progressText: '82%' },
              { title: '設計', progressText: '70%' },
          ])
        : [
              { title: '創意', progressText: '82%' },
              { title: '行銷', progressText: '82%' },
              { title: '設計', progressText: '70%' },
          ];

    // Gallery
    const bannerAlt = (loaded && aboutBannerAlt) || md?.aboutBannerAlt;
    const banners = {
        one: (loaded && aboutBannerOne) || md?.aboutBannerOne,
        two: (loaded && aboutBannerTwo) || md?.aboutBannerTwo,
        three: (loaded && aboutBannerThree) || md?.aboutBannerThree,
        four: (loaded && aboutBannerFour) || md?.aboutBannerFour,
        five: (loaded && aboutBannerFive) || md?.aboutBannerFive,
    };

    // Addresses
    const addrTitleOne = (loaded && aboutAddrTitleOne) || md?.addressTitleOne;
    const addrDescOne = (loaded && aboutAddrDescOne) || md?.addressDescOne;
    const addrTitleTwo = (loaded && aboutAddrTitleTwo) || md?.addressTitleTwo;
    const addrDescTwo = (loaded && aboutAddrDescTwo) || md?.addressDescTwo;

    return (
        <div className="about border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
            <div className="video-banner">
                <div className="container">
                    <div className="blog-img relative flex overflow-hidden after:transition-all after:duration-500 after:bg-[rgba(0,0,0,.4)] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:opacity-0 hover:after:opacity-100 group">
                        <img
                            className="object-cover object-center w-full transition-all duration-500 group-hover:scale-[1.05]"
                            src={videoBanner}
                            alt={videoBannerAlt}
                            width={1170}
                            height={680}
                        />
                        <VideoModal videoUrl={videoUrl} />
                    </div>
                </div>
            </div>
            <div className="support-info">
                <div className="container">
                    <div className="grid grid-cols-12 gap-x-[30px] max-md:gap-y-[30px] my-[60px]">
                        {supportInfo.map((items: any) => {
                            const InfoIcon = IoIcon[items.infoIcon as keyof typeof IoIcon];
                            return (
                                <div
                                    className="lg:col-span-3 md:col-span-4 lm:col-span-6 col-span-12"
                                    key={items.id}
                                >
                                    <div className="single-support-info">
                                        <div className="flex flex-col">
                                            <div className="content flex items-center mb-[20px]">
                                                <span className="icon mr-[20px] text-[36px]">
                                                    {InfoIcon && <InfoIcon />}
                                                </span>
                                                <h2 className="text-[18px]">
                                                    {items.title}
                                                </h2>
                                            </div>
                                            <p className="lg:max-w-[250px]">
                                                {items.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="perfection">
                <div className="container">
                    <div className="grid grid-cols-12 lm:gap-x-[40px] max-sm:gap-y-[30px]">
                        <div className="lm:col-span-7 col-span-12">
                            <h2 className="text-[24px] mb-[10px]">
                                {perfTitle}
                            </h2>
                            <p>{perfDesc}</p>
                        </div>
                        <div className="lm:col-span-5 col-span-12">
                            {progressBars.map((bar: any, index: number) => (
                                <ProgressBar
                                    key={index}
                                    title={bar.title}
                                    progressText={bar.progressText}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="about-banner xl:pt-[120px] lg:pt-[100px] md:pt-[80px] pt-[50px]">
                <div className="container">
                    <div className="grid grid-cols-12 gap-[10px]">
                        <div className="col-span-8">
                            <div className="single-img overflow-hidden">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={banners.one}
                                    alt={bannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-4">
                            <div className="single-img overflow-hidden mb-[10px]">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={banners.two}
                                    alt={bannerAlt}
                                />
                            </div>
                            <div className="single-img overflow-hidden">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={banners.three}
                                    alt={bannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-4">
                            <div className="single-img overflow-hidden">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={banners.four}
                                    alt={bannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-8">
                            <div className="single-img overflow-hidden">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={banners.five}
                                    alt={bannerAlt}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="address pt-[60px]">
                <div className="container">
                    <div className="grid grid-cols-12 gap-x-[30px] max-sm:gap-y-[30px]">
                        <div className="lm:col-span-7 col-span-12">
                            <h2 className="text-[30px]">
                                {addrTitleOne}
                            </h2>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: addrDescOne,
                                }}
                            />
                        </div>
                        <div className="lm:col-span-5 col-span-12">
                            <h2 className="text-[30px]">
                                {addrTitleTwo}
                            </h2>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: addrDescTwo,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;
