import {SwiperSettings} from "@/components/SwiperComps/SwiperTypes";

export interface BrandItem {
    id: string | number;
    brandImg: string;
    brandImgAlt: string;
}



export interface BrandProps {
    brandItems: BrandItem[];
    settings?: SwiperSettings;
}