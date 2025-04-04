"use client";
import React, {JSX, useState} from 'react';
import dynamic from 'next/dynamic';
import ProductItem from '../Products/ProductItem';
import {Product, ProductFilterItem} from "@/components/Products/ProductsTypes";
import {Slide} from "@/components/SwiperComps/SwiperComps";


interface TabListItem {
    id: number;
    title: string;
    filterValue: string;
}

interface SwiperSettings {
    pagination?: boolean;
    navigation?: {
        nextEl: string;
        prevEl: string;
    };
    spaceBetween?: number;
    loop?: boolean;
    breakpoints?: {
        [key: number]: {
            slidesPerView: number;
        };
    };
    slidesPerView?: number;
    autoplay?: boolean;
}

interface ProductTabSliderProps {
    products: Product[];
    containerCName: string;
    productTab: {
        tabList?: TabListItem[];
    }[];
    tabTitle: string;
    productFilter: ProductFilterItem[];
    productFilterPath: string;
    settings?: SwiperSettings;
}

export default function ProductTabSlider({
                                             products: initialProduct,
                                             containerCName,
                                             productTab,
                                             tabTitle,
                                             productFilter,
                                             productFilterPath,
                                             settings: initialSettings,
                                         }: ProductTabSliderProps): JSX.Element {
    const [products, setProduct] = useState<Product[]>(initialProduct);
    const [currentFilter, setCurrentFilter] = useState<string>('all-products');

    const onFilterHandler = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const target = e.target as HTMLButtonElement;
        const filterValue = target.dataset.filter;
        if (filterValue) {
            setCurrentFilter(filterValue);

            // 使用變量賦值來避免 ESLint 警告
            const productsToSet = filterValue === 'all-products'
                ? initialProduct
                : initialProduct.filter((pro) => pro.category === filterValue);

            setProduct(productsToSet);
        }
    };

    const SwiperComps = dynamic(() => import('@/components/SwiperComps/SwiperComps'), {
        ssr: false,
    });

    // 設置 Swiper 參數
    const settings: SwiperSettings = {
        pagination: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        spaceBetween: 30,
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
                slidesPerView: 4,
            },
        },
        ...initialSettings
    };

    return (
        <div className="product-tab-slider pt-[125px]">
            <div className={containerCName}>
                <div className="grid grid-cols-12 items-center">
                    <div className="md:col-span-4 col-span-12">
                        <h2 className="md:text-start text-center text-[30px] max-lm:mb-[20px]">
                            {tabTitle}
                        </h2>
                    </div>
                    <div className="md:col-span-8 col-span-12">
                        <div className="tab-menu max-lm:text-center text-end">
                            {productTab[0]?.tabList?.map((item) => (
                                <button
                                    key={item.id}
                                    className={`${
                                        currentFilter === item.filterValue
                                            ? 'active'
                                            : ''
                                    }`}
                                    type="button"
                                    onClick={onFilterHandler}
                                    data-filter={item.filterValue}
                                >
                                    {item.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="slider-wrap relative pt-[25px]">
                    <SwiperComps settings={settings}>
                        {products?.map((product) => (
                            <Slide key={product.id}>
                                <ProductItem
                                    product={product}
                                    productFilter={productFilter}
                                    productFilterPath={productFilterPath}
                                />
                            </Slide>
                        ))}
                    </SwiperComps>
                </div>
            </div>
        </div>
    );
}