import { ReactNode } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, {
    Autoplay,
    Navigation,
    Pagination,
    Thumbs,
    EffectFade,
} from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// install Swiper modules
SwiperCore.use([Autoplay, Navigation, Pagination, Thumbs, EffectFade]);

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
        <Swiper className={`${sliderCName}`} {...sliderOptions}>
            {children}
        </Swiper>
    );
}

export { SwiperSlide as Slide };

export default SwiperComps;
