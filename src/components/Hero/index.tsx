import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import SwiperComps, { Slide } from '../SwiperComps';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { normalizeDefaultSlide, buildOverlayStyle } from './hero-utils';

function HeroOne() {
    const heroDefaultJson = useSettingsStore((s) => s.hero_default_json);
    const btnShopNow = useSettingsStore((s) => s.btn_shop_now);
    const heroDefaultItems = useMemo(() => {
        try { return JSON.parse(heroDefaultJson); } catch { return []; }
    }, [heroDefaultJson]);

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

    if (heroDefaultItems.length === 0) return null;

    const settings: Record<string, any> = {
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
                    {heroDefaultItems?.map((heroDefaultItemRaw, idx) => {
                        const heroDefaultItem = normalizeDefaultSlide(heroDefaultItemRaw);
                        const btnClass = heroDefaultItem.buttonStyle === 'light'
                            ? 'inline-flex items-center bg-white text-secondary leading-[38px] text-[15px] h-[38px] px-5'
                            : secondaryButton;
                        const arrowColor = heroDefaultItem.buttonStyle === 'light' ? 'text-secondary ml-[5px]' : 'text-white ml-[5px]';
                        return (
                        <Slide key={heroDefaultItem.id}>
                            <div
                                className="relative flex items-center bg-cover bg-center bg-no-repeat md:h-[800px] h-[540px]"
                                style={{ backgroundImage: `url('${heroDefaultItem.backgroundImage}')` }}
                            >
                                {heroDefaultItem.overlayOpacity > 0 && (
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={buildOverlayStyle(heroDefaultItem.overlayColor, heroDefaultItem.overlayOpacity, heroDefaultItem.overlayDirection)}
                                    />
                                )}
                                <div className="container relative z-10">
                                    <div className="hero-content">
                                        <motion.span
                                            className="font-medium block mb-[5px]"
                                            style={{ color: heroDefaultItem.subtitleColor }}
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
                                            style={{ color: heroDefaultItem.textColor }}
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
                                            style={{ color: heroDefaultItem.textColor }}
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
                                                className={btnClass}
                                            >
                                                {btnShopNow}
                                                <IoArrowForwardOutline className={arrowColor} />
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </Slide>
                        );
                    })}
                </SwiperComps>
            </div>
        </div>
    );
}

export default HeroOne;
