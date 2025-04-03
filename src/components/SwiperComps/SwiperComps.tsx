import { Swiper, SwiperSlide } from 'swiper/react';
import {
    Autoplay,
    Navigation,
    Pagination,
    Thumbs,
    EffectFade,
} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import type { SwiperSettings } from './SwiperTypes';
import React, {JSX} from "react";

/**
 * SwiperComps 組件參數
 *
 * @interface SwiperCompsProps
 * @property {string} message Swiper 上方顯示的訊息
 * @property {React.ReactNode} children 幻燈片內容
 * @property {string} [sliderCName] Swiper 外層樣式類名
 * @property {SwiperSettings} [settings] 傳入的 Swiper 設定
 */
interface SwiperCompsProps {
    message?: string;
    children: React.ReactNode;
    sliderCName?: string;
    settings?: SwiperSettings;
}

/**
 * SwiperComps 元件
 * 建立可自訂模組與設定的 Swiper 幻燈片區塊。
 *
 * @param {SwiperCompsProps} props 組件參數
 * @returns {JSX.Element} 幻燈片元件
 */
export default function SwiperComps({
                                        message,
                                        children,
                                        sliderCName,
                                        settings,
                                    }: SwiperCompsProps): JSX.Element {
    return (
        <>
            <p>{message}</p>
            <Swiper
                className={sliderCName ?? ''}
                {...settings}
                modules={[Autoplay, Navigation, Pagination, Thumbs, EffectFade]}
            >
                {children}
            </Swiper>
        </>
    );
}

/**
 * 匯出單一幻燈片元件別名
 */
export { SwiperSlide as Slide };
