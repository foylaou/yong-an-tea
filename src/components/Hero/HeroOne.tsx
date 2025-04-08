"use client";
import React, {JSX, useState} from 'react';
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

import SwiperComps, {Slide} from "@/components/SwiperComps/SwiperComps";

import {SwiperSettings} from "@/components/SwiperComps/SwiperTypes";
import {Swiper} from "swiper/types";
import {HeroDefaultItem} from "@/components/Hero/HeroTypes";

// 定義組件 Props 的介面
interface HeroOneProps {
    heroDefaultItems: HeroDefaultItem[];
    settings?: SwiperSettings;
}

export default function HeroOne({
                                    heroDefaultItems,
                                    settings: initialSettings
                                }: HeroOneProps): JSX.Element {
    const [activeIdx, setActiveId] = useState(0);

    const onSlideChange = (swiper: Swiper) => {
        setActiveId(swiper.activeIndex);
    };

    const onSlideChangeTransitionStart = () => {
        setActiveId(-1);
    };

    const onSlideChangeTransitionEnd = (swiper: Swiper) => {
        setActiveId(swiper.activeIndex);
    };

    // 合併設定
    const settings: SwiperSettings = {
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: { clickable: true, type: 'bullets' },
        navigation: false,
        slidesPerView: 1,
        spaceBetween: 0,

        onSlideChange,
        onSlideChangeTransitionStart,
        onSlideChangeTransitionEnd,
        ...initialSettings,
    };



    return (
        <div className="hero-area pt-[100px]">
            <div className="container-fluid px-[15px] mt-[100px]">
                <SwiperComps
                    sliderCName="pagination-bg-primary"
                    settings={settings}
                >
                    {heroDefaultItems?.map((heroDefaultItem, idx) => (
                        <Slide key={heroDefaultItem.id}>
                            <div
                                className="md:h-[800px] h-[540px] bg-cover bg-center bg-no-repeat relative"
                                style={{ backgroundImage: `url(${heroDefaultItem.heroBG})` }}
                            >
                                {/* 渐变遮罩层 */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black to-80% opacity-80"></div>

                                <div className="container relative z-10">
                                    <div className="hero-content text-white">
                                        <motion.span
                                            className="text-primary font-medium block mb-[5px]"
                                            dangerouslySetInnerHTML={{
                                                __html: heroDefaultItem.subtitle,
                                            }}
                                            initial="hidden"
                                            animate={
                                                idx === activeIdx
                                                    ? 'visible'
                                                    : 'exit'
                                            }
                                            exit="exit"
                                            variants={{
                                                hidden: {
                                                    y: '100%',
                                                    opacity: 0,
                                                },
                                                visible: {
                                                    y: '0',
                                                    opacity: 1,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 0.3,
                                                    },
                                                },
                                                exit: {
                                                    y: '100%',
                                                    opacity: 0,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 0.3,
                                                    },
                                                },
                                            }}
                                        />
                                        <motion.h2
                                            className="text-amber-50 relative md:text-[60px] text-[34px] leading-[1.1] pb-[15px] mb-[30px] after:bg-slate-900 after:absolute after:min-h-[4px] after:min-w-[70px] after:max-h-[4px] after:max-w-[70px] after:bottom-0 after:left-0"
                                            dangerouslySetInnerHTML={{
                                                __html: heroDefaultItem.title,
                                            }}
                                            initial="hidden"
                                            animate={
                                                idx === activeIdx
                                                    ? 'visible'
                                                    : 'exit'
                                            }
                                            exit="exit"
                                            variants={{
                                                hidden: {
                                                    y: '100%',
                                                    opacity: 0,
                                                },
                                                visible: {
                                                    y: '0',
                                                    opacity: 1,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 0.6,
                                                    },
                                                },
                                                exit: {
                                                    y: '100%',
                                                    opacity: 0,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 0.6,
                                                    },
                                                },
                                            }}
                                        />
                                        <motion.p
                                            dangerouslySetInnerHTML={{
                                                __html: heroDefaultItem.desc,
                                            }}
                                            initial="hidden"
                                            animate={
                                                idx === activeIdx
                                                    ? 'visible'
                                                    : 'exit'
                                            }
                                            exit="exit"
                                            variants={{
                                                hidden: {
                                                    y: '100%',
                                                    opacity: 0,
                                                },
                                                visible: {
                                                    y: '0',
                                                    opacity: 1,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 0.9,
                                                    },
                                                },
                                                exit: {
                                                    y: '100%',
                                                    opacity: 0,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 0.9,
                                                    },
                                                },
                                            }}
                                        />
                                        <motion.div
                                            className="mt-[30px]"
                                            initial="hidden"
                                            animate={
                                                idx === activeIdx
                                                    ? 'visible'
                                                    : 'exit'
                                            }
                                            exit="exit"
                                            variants={{
                                                hidden: {
                                                    y: '100%',
                                                    opacity: 0,
                                                },
                                                visible: {
                                                    y: '0',
                                                    opacity: 1,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 1.2,
                                                    },
                                                },
                                                exit: {
                                                    y: '100%',
                                                    opacity: 0,
                                                    transition: {
                                                        duration: 1,
                                                        delay: 1.2,
                                                    },
                                                },
                                            }}
                                        >
                                            <Link
                                                href="/products/left-sidebar"
                                                className="inline-flex items-center bg-emerald-900 text-white leading-[38px] text-[15px] h-[38px] px-5 group"
                                            >
                                                Shop Now
                                                <IoArrowForwardOutline className="text-white ml-[5px]" />
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </Slide>
                    ))}
                </SwiperComps>
            </div>
        </div>
    );
}