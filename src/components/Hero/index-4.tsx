import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import SwiperComps, { Slide } from '../SwiperComps';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface HeroFourProps {
    btnText: string;
}

function HeroFour({ btnText }: HeroFourProps) {
    const heroCollectionJson = useSettingsStore((s) => s.hero_collection_json);
    const siteName = useSettingsStore((s) => s.site_name);
    const siteDescription = useSettingsStore((s) => s.site_description);
    const heroCollectionItems = useMemo(() => {
        try { return JSON.parse(heroCollectionJson); } catch { return []; }
    }, [heroCollectionJson]);

    const [activeIdx, setActiveId] = useState(0);
    const onSlideChange = (SwiperComps: any) => {
        const { activeIndex } = SwiperComps;
        setActiveId(activeIndex);
    };
    const onSlideChangeTransitionStart = () => {
        setActiveId(-1);
    };

    const onSlideChangeTransitionEnd = (SwiperComps: any) => {
        const { activeIndex } = SwiperComps;
        setActiveId(activeIndex);
    };

    if (heroCollectionItems.length === 0) return null;

    const settings: Record<string, any> = {
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet(index: number, className: string) {
                return `<span class="${className}">${(index + 1)
                    .toString()
                    .padStart(2, '0')}</span>`;
            },
        },
        navigation: false,
        slidesPerView: 1,
        spaceBetween: 0,
        onSlideChange,
        onSlideChangeTransitionStart,
        onSlideChangeTransitionEnd,
    };

    return (
        <div className="hero-area">
            <div className="container-fluid">
                <SwiperComps sliderCName="hero-collection" settings={settings}>
                    {heroCollectionItems?.map((heroCollectionItem, idx) => (
                        <Slide key={heroCollectionItem.id}>
                            <div className="slide-inner bg-[#f1f1f1] flex items-center xl:h-[900px] h-[550px]">
                                <div className="container">
                                    <div className="grid grid-cols-12">
                                        <div className="md:col-span-6 col-span-12 self-center">
                                            <div className="slide-content pt-[50px] md:pt-0">
                                                <motion.span
                                                    className="text-primary lg:text-[24px] text-[20px] block lg:mb-[25px] mb-[15px]"
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
                                                >
                                                    {heroCollectionItem.subtitle || siteName}
                                                </motion.span>
                                                <motion.h2
                                                    className="lg:text-[60px] lg:leading-[66px] sm:text-[34px] text-[30px] mb-[30px]"
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
                                                >
                                                    {heroCollectionItem.title}
                                                </motion.h2>
                                                <motion.p
                                                    className="hidden md:block fixed-lg:text-[15px]"
                                                    dangerouslySetInnerHTML={{
                                                        __html: heroCollectionItem.desc || siteDescription,
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
                                                    className="lg:mt-[60px] mt-[20px]"
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
                                                        className="text-[18px] flex items-center transition-all hover:text-primary"
                                                    >
                                                        {btnText}
                                                        <IoArrowForwardOutline className="light-stroke ml-[5px]" />
                                                    </Link>
                                                </motion.div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 lm:col-span-7 col-span-8">
                                            <div className="slide-img pt-[50px] md:pt-0">
                                                <img
                                                    className="ml-auto"
                                                    src={
                                                        heroCollectionItem.image as string
                                                    }
                                                    alt={
                                                        heroCollectionItem.imageAlt as string
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Slide>
                    ))}
                    <div className="swiper-pagination" />
                </SwiperComps>
            </div>
        </div>
    );
}

export default HeroFour;
