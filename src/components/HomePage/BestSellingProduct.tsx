"use client";
import type { SwiperSettings } from '../SwiperComps/SwiperTypes';
import SwiperComps, {Slide} from "@/components/SwiperComps/SwiperComps";
import {JSX} from "react";
import ProductItem from "@/components/Products/ProductItem";
import {Product, ProductFilterItem} from "@/components/Products/ProductsTypes";



/**
 * BestSellingProduct 組件的參數
 *
 * @interface BestSellingProductProps
 * @property {Product[]} products 商品資料陣列
 * @property {any} productFilter 商品篩選條件
 * @property {string} productFilterPath 篩選連結路徑
 * @property {string} sectionTitle 區塊標題
 * @property {SwiperSettings} [settings] 傳入 Swiper 設定，可被覆蓋
 */
interface BestSellingProductProps {
    products: Product[];
    productFilter: ProductFilterItem[];
    productFilterPath?: string;
    sectionTitle: string;
    settings?: SwiperSettings;
}

/**
 * BestSellingProduct - 暢銷商品輪播區塊
 *
 * @param {BestSellingProductProps} props 組件參數
 * @returns {JSX.Element} 商品輪播區
 */
export default function BestSellingProduct({
                                               products,
                                               productFilter,
                                               productFilterPath,
                                               sectionTitle,
                                               settings: propSettings,
                                           }: BestSellingProductProps): JSX.Element {
    const settings: SwiperSettings = {
        spaceBetween: 25,
        pagination: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        loop: false,
        breakpoints: {
            1200: { slidesPerView: 4 },
            992: { slidesPerView: 3 },
            576: { slidesPerView: 2 },
            0: { slidesPerView: 1 },
        },
        ...propSettings, // ✅ 合併外部設定
    };

    return (
        <div className="best-selling-product xl:pt-[120px] lg:pt-[60px] pt-[5px]">
            <div className="container mx-auto px-4">
                <div className="section-title text-center pb-[10px] mb-[50px] relative after:bg-primary after:absolute after:left-1/2 after:transform after:-translate-x-1/2 after:bottom-0 after:h-[4px] after:w-[70px]">
                    <h2 className="text-center w-full">{sectionTitle}</h2>
                </div>
                <div className="slider-wrap relative">
                    <SwiperComps settings={settings}>
                        {products.slice(0, 5).map((product) => (
                            <Slide key={product.slug}>
                                <ProductItem
                                    product={product}
                                    productFilter={productFilter}
                                    productFilterPath={productFilterPath}
                                />
                            </Slide>
                        ))}
                    </SwiperComps>
                    <div className="swiper-button-wrap">
                        <div className="swiper-button-prev xxl:!left-[-40px] after:!text-[24px] after:!text-[#666666]" />
                        <div className="swiper-button-next xxl:!right-[-40px] after:!text-[24px] after:!text-[#666666]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
