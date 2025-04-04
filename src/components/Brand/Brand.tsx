"use client";
import Link from 'next/link';
import dynamic from 'next/dynamic';

import Image from "next/image";
import {SwiperSettings} from "@/components/SwiperComps/SwiperTypes";
import {Slide} from "@/components/SwiperComps/SwiperComps";
import {BrandProps} from "@/components/Brand/BrandType";



export default function Brand({ brandItems, settings: propSettings }: BrandProps) {
    const SwiperComps = dynamic(() => import('@/components/SwiperComps/SwiperComps'), {
        ssr: false,
    });

    const settings: SwiperSettings = {
        pagination: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        loop: true,
        breakpoints: {
            0: {
                slidesPerView: 2,
            },
            576: {
                slidesPerView: 3,
            },
            768: {
                slidesPerView: 4,
            },
            992: {
                slidesPerView: 5,
            },
        },
        ...propSettings,
    };

    return (
        <div className="brand lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="homebox-container relative xl:mx-[100px] mx-[15px]">
                <div className="slider-wrap relative">
                    <SwiperComps settings={settings}>
                        {brandItems?.map((brandItem) => (
                            <Slide key={brandItem.id}>
                                <Link href="#" className="slide-inner">
                                    <Image
                                        className="opacity-[0.35] transition-all duration-500 hover:opacity-100"
                                        src={brandItem.brandImg}
                                        alt={brandItem.brandImgAlt}
                                    />
                                </Link>
                            </Slide>
                        ))}
                    </SwiperComps>
                    <div className="swiper-button-wrap hidden lg:block">
                        <div className="swiper-button-prev xl:!left-[-40px] lg:!left-[-15px] after:!text-[24px] after:!text-[#666666]" />
                        <div className="swiper-button-next xl:!right-[-40px] lg:!right-[-15px] after:!text-[24px] after:!text-[#666666]" />
                    </div>
                </div>
            </div>
        </div>
    );
}