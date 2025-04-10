"use client";
import * as IoIcon from 'react-icons/io5';
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import VideoModal from "@/components/VideoModal/VideoModal";

/**
 * 支援資訊項目
 * 表示單一支援資訊的內容。
 *
 * @interface SingleSupportInfo
 * @member {string | number} id 唯一識別碼，可為字串或數字
 * @member {string} infoIcon 圖示路徑或 URL
 * @member {string} title 支援標題
 * @member {string} desc 支援描述文字
 */
interface SingleSupportInfo {
    id: string | number;
    infoIcon: string;
    title: string;
    desc: string;
}

/**
 * 關於我們項目
 * 描述「關於我們」區塊中的內容與媒體資料。
 *
 * @interface AboutItem
 * @member {string} videoBanner 影片橫幅路徑或 URL
 * @member {string} videoBannerAlt 影片橫幅替代文字
 * @member {SingleSupportInfo[]} singleSupportInfo 支援資訊陣列
 * @member {string} perfectionTitle 完善標題文字
 * @member {string} perfectionDesc 完善描述文字
 * @member {string} aboutBannerOne 第一張橫幅圖
 * @member {string} aboutBannerTwo 第二張橫幅圖
 * @member {string} aboutBannerThree 第三張橫幅圖
 * @member {string} aboutBannerFour 第四張橫幅圖
 * @member {string} aboutBannerFive 第五張橫幅圖
 * @member {string} aboutBannerAlt 橫幅替代文字
 * @member {string} addressTitleOne 地址區塊第一標題
 * @member {string} addressDescOne 地址區塊第一描述
 * @member {string} addressTitleTwo 地址區塊第二標題
 * @member {string} addressDescTwo 地址區塊第二描述
 */
interface AboutItem {
    videoBanner: string;
    videoBannerAlt: string;
    singleSupportInfo: SingleSupportInfo[];
    perfectionTitle: string;
    perfectionDesc: string;
    aboutBannerOne: string;
    aboutBannerTwo: string;
    aboutBannerThree: string;
    aboutBannerFour: string;
    aboutBannerFive: string;
    aboutBannerAlt: string;
    addressTitleOne: string;
    addressDescOne: string;
    addressTitleTwo: string;
    addressDescTwo: string;
}

/**
 * 關於我們元件的屬性
 * 用於傳遞關於我們頁面的相關項目。
 *
 * @interface AboutUsProps
 * @member {AboutItem[]} aboutItems 關於我們項目的陣列
 */
export interface AboutUsProps {
    aboutItems: AboutItem[];
}


export default function AboutUs({ aboutItems }: AboutUsProps) {
    return (
        <div className="about border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
            <div className="video-banner">
                <div className="container">
                    <div className="blog-img relative flex overflow-hidden after:transition-all after:duration-500 after:bg-[rgba(0,0,0,.4)] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:opacity-0 hover:after:opacity-100 group">
                        <Image
                            className="object-cover object-center w-full transition-all duration-500 group-hover:scale-[1.05]"
                            src={aboutItems[0]?.videoBanner}
                            alt={aboutItems[0]?.videoBannerAlt}
                            width={1170}
                            height={680}
                        />
                        <VideoModal />
                    </div>
                </div>
            </div>
            <div className="support-info">
                <div className="container">
                    <div className="grid grid-cols-12 gap-x-[30px] max-md:gap-y-[30px] my-[60px]">
                        {aboutItems[0]?.singleSupportInfo?.map((items) => {
                            // 將 IoIcon 的索引類型處理為 keyof
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
                          <InfoIcon />
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
                                {aboutItems[0]?.perfectionTitle}
                            </h2>
                            <p>{aboutItems[0]?.perfectionDesc}</p>
                        </div>
                        <div className="lm:col-span-5 col-span-12">
                            <ProgressBar
                                title="Creativity"
                                progressText="82%"
                            />
                            <ProgressBar
                                title="Advertising"
                                progressText="82%"
                            />
                            <ProgressBar title="Design" progressText="70%" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="about-banner xl:pt-[120px] lg:pt-[100px] md:pt-[80px] pt-[50px]">
                <div className="container">
                    <div className="grid grid-cols-12 gap-[10px]">
                        <div className="col-span-8">
                            <div className="single-img overflow-hidden">
                                <Image
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutItems[0]?.aboutBannerOne}
                                    alt={aboutItems[0]?.aboutBannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-4">
                            <div className="single-img overflow-hidden mb-[10px]">
                                <Image
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutItems[0]?.aboutBannerTwo}
                                    alt={aboutItems[0]?.aboutBannerAlt}
                                />
                            </div>
                            <div className="single-img overflow-hidden">
                                <Image
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutItems[0]?.aboutBannerThree}
                                    alt={aboutItems[0]?.aboutBannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-4">
                            <div className="single-img overflow-hidden">
                                <Image
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutItems[0]?.aboutBannerFour}
                                    alt={aboutItems[0]?.aboutBannerAlt}
                                />
                            </div>
                        </div>
                        <div className="col-span-8">
                            <div className="single-img overflow-hidden">
                                <Image
                                    className="w-full block transition-all duration-500 hover:scale-[1.05]"
                                    src={aboutItems[0]?.aboutBannerFive}
                                    alt={aboutItems[0]?.aboutBannerAlt}
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
                                {aboutItems[0]?.addressTitleOne}
                            </h2>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: aboutItems[0]?.addressDescOne,
                                }}
                            />
                        </div>
                        <div className="lm:col-span-5 col-span-12">
                            <h2 className="text-[30px]">
                                {aboutItems[0]?.addressTitleTwo}
                            </h2>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: aboutItems[0]?.addressDescTwo,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
