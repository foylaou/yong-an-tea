import { useState, useEffect } from 'react';
import * as IoIcon from 'react-icons/io5';
import ProgressBar from '../ProgressBar';
import VideoModal from '../VideoModal';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface BranchInfo {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    business_hours: string;
    image_url: string;
    is_primary: boolean;
}

function parseJSON<T>(raw: string | undefined, fallback: T): T {
    try {
        if (raw) return JSON.parse(raw);
        return fallback;
    } catch {
        return fallback;
    }
}

function AboutUs() {
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
    const [branches, setBranches] = useState<BranchInfo[]>([]);

    useEffect(() => {
        fetch('/api/branches')
            .then((res) => res.json())
            .then((data) => {
                if (data.branches) setBranches(data.branches);
            })
            .catch(() => {});
    }, []);

    const supportInfo = parseJSON(aboutSupportInfoJson, []);
    const progressBars = parseJSON(aboutProgressJson, [
        { title: '創意', progressText: '82%' },
        { title: '行銷', progressText: '82%' },
        { title: '設計', progressText: '70%' },
    ]);

    return (
        <div className="about border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
            <div className="video-banner">
                <div className="container">
                    <div className="blog-img relative flex overflow-hidden after:transition-all after:duration-500 after:bg-[rgba(0,0,0,.4)] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:opacity-0 hover:after:opacity-100 group">
                        <img
                            className="object-cover object-center w-full transition-all duration-500 group-hover:scale-[1.05]"
                            src={aboutVideoBanner}
                            alt={aboutVideoBannerAlt}
                            width={1170}
                            height={680}
                        />
                        <VideoModal videoUrl={aboutVideoUrl} />
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
                                {aboutPerfectionTitle}
                            </h2>
                            <p>{aboutPerfectionDesc}</p>
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
                                    src={aboutBannerOne}
                                    alt={aboutBannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-4">
                            <div className="single-img overflow-hidden mb-[10px]">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutBannerTwo}
                                    alt={aboutBannerAlt}
                                />
                            </div>
                            <div className="single-img overflow-hidden">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutBannerThree}
                                    alt={aboutBannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-4">
                            <div className="single-img overflow-hidden">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutBannerFour}
                                    alt={aboutBannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-8">
                            <div className="single-img overflow-hidden">
                                <img
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutBannerFive}
                                    alt={aboutBannerAlt}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {branches.length > 0 && (
                <div className="address pt-[60px]">
                    <div className="container">
                        <div className="grid grid-cols-12 gap-x-[30px] max-sm:gap-y-[30px]">
                            {branches.map((branch) => (
                                <div
                                    key={branch.id}
                                    className={`col-span-12 ${branches.length === 1 ? '' : 'lm:col-span-6'}`}
                                >
                                    <h2 className="text-[30px]">{branch.name}</h2>
                                    <p>
                                        {branch.address && <>{branch.address}<br /></>}
                                        {branch.phone && <>{branch.phone}<br /></>}
                                        {branch.email && <>{branch.email}<br /></>}
                                        {branch.business_hours && <>{branch.business_hours}</>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AboutUs;
