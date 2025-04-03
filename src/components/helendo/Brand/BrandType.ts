export interface BrandItem {
    id: string | number;
    brandImg: string;
    brandImgAlt: string;
}

export interface SwiperSettings {
    slidesPerView?: number;
    spaceBetween?: number;
    autoplay?: boolean;
    navigation?: {
        nextEl: string;
        prevEl: string;
    };
    pagination?: boolean | object;
    loop?: boolean;
    breakpoints?: {
        [key: number]: {
            slidesPerView: number;
        };
    };
}

export interface BrandProps {
    brandItems: BrandItem[];
    settings?: SwiperSettings;
}