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

    // Tailwind Related Stuff
    const secondaryButton =
        'inline-flex items-center bg-secondary text-white leading-[38px] text-[15px] h-[38px] px-5';

    return (
        <div className="hero-area">
            <div className="container-fluid px-[15px] mt-[15px]">
                <SwiperComps
                    sliderCName="pagination-bg-primary"
                    settings={settings}
                >
                    {heroDefaultItems?.map((heroDefaultItem, idx) => (
                        <Slide key={heroDefaultItem.id}>
                            <div
                                className={`${heroDefaultItem.heroBG
                                    .split(' ')
                                    .join(' ')} md:h-[800px] h-[540px]`}
                            >
                                <div className="container">
                                    <div className="hero-content">
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
                                            className="relative md:text-[60px] text-[34px] leading-[1.1] pb-[15px] mb-[30px] after:bg-primary after:absolute after:min-h-[4px] after:min-w-[70px] after:max-h-[4px] after:max-w-[70px] after:bottom-0 after:left-0"
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
                                                className={secondaryButton}
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