import { ReactNode } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Thumbs, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface SwiperCompsProps {
    children: ReactNode;
    sliderCName?: string;
    settings?: Record<string, any>;
}

function SwiperComps({ children, sliderCName, settings }: SwiperCompsProps) {
    const sliderOptions = {
        ...settings,
    };
    return (
        <Swiper
            className={`${sliderCName}`}
            modules={[Autoplay, Navigation, Pagination, Thumbs, EffectFade]}
            {...sliderOptions}
        >
            {children}
        </Swiper>
    );
}

export { SwiperSlide as Slide };

export default SwiperComps;
