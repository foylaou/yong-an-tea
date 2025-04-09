"use client";
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';
import {JSX} from "react";
import Image from "next/image";
/**
 * Featured 商品資料型別
 *
 * @interface FeaturedProductItem
 * @property {string} path 商品導向連結
 * @property {string} image 商品圖片
 * @property {string} altImage 圖片替代文字
 * @property {string} subTitle 商品子標題
 * @property {string} title 商品標題
 * @property {string} excerpt 商品描述內容，可含 HTML
 * @property {string} buttonText 按鈕文字
 */
interface FeaturedProductItem {
    path: string;
    image: string;
    altImage: string;
    subTitle: string;
    title: string;
    excerpt: string;
    buttonText: string;
}

/**
 * FeaturedProduct 元件參數
 *
 * @interface FeaturedProductProps
 * @property {FeaturedProductItem[]} featuredProduct Featured 商品陣列，建議長度為 3
 */
interface FeaturedProductProps {
    featuredProduct: FeaturedProductItem[];
}

/**
 * FeaturedProduct - 三筆特色商品展示區塊
 *
 * @param {FeaturedProductProps} props 組件參數
 * @returns {JSX.Element} 特色商品展示區塊
 */
export default function FeaturedProduct({
                                            featuredProduct,
                                        }: FeaturedProductProps): JSX.Element {
    const outlineButton =
        'inline-flex items-center border border-secondary text-secondary transition-all hover:bg-secondary hover:text-white leading-[38px] text-[15px] h-[38px] px-[35px] group';

    const sections = ['天然', '在地', '好茶'];

    return (
        <>
            {featuredProduct.map((item, index) => (
                <div
                    key={index}
                    className={`featured-product ${
                        index === 1
                            ? 'xl:pt-[135px] lg:pt-[115px] md:pt-[95px] pt-[65px]'
                            : 'xl:pt-[120px] lg:pt-[100px] md:pt-[80px] pt-[50px]'
                    } ${
                        index === 2 ? 'xl:pb-[110px] lg:pb-[90px] pb-[60px]' : ''
                    } relative before:content-[attr(data-count)] before:absolute before:text-[#F5F4F7] before:font-semibold ${
                        index === 1
                            ? 'before:bottom-[-75px] before:left-0'
                            : index === 2
                                ? 'before:bottom-[35px] before:right-0'
                                : 'before:sm:bottom-[-15px] before:bottom-[-60px] before:right-0'
                    } before:z-[1] before:xxl:text-[150px] before:xl:text-[80px] before:text-[40px]`}
                    data-count={sections[index]}
                >
                    {/* 在這裡我們保留 container 類，但直接修改內部 grid 容器的樣式 */}
                    <div className="container flex justify-center">
                        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-x-[50px] lm:gap-x-[40px] gap-x-[30px] md:gap-y-0 gap-y-[30px] group items-center max-w-5xl w-full">
                            <div className={`md:col-span-1 col-span-1 self-center ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                <Link
                                    href={item.path}
                                    className="featured-product-img block transition-all duration-500 group-hover:scale-[1.05]"
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.altImage}
                                        width={0}
                                        height={0}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="w-full h-auto"
                                    />
                                </Link>
                            </div>
                            <div
                                className={`md:col-span-1 col-span-1 self-center ${
                                    index % 2 === 1 ? 'md:order-1' : ''
                                }`}
                            >
                                <div className="featured-product-content md:pl-[15px]">
                                <span
                                    className="text-[14px] leading-5 font-medium uppercase block mb-[5px] text-[#999999]">
                                    {item.subTitle}
                                </span>
                                    <h2 className="relative after:bg-primary after:absolute after:left-0 after:bottom-0 after:h-[4px] after:w-[70px] pb-[10px] mb-[30px]">
                                        <Link
                                            href={item.path}
                                            className="transition-all hover:text-primary"
                                        >
                                            {item.title}
                                        </Link>
                                    </h2>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: item.excerpt,
                                        }}
                                    />
                                    <div className="mt-[60px]">
                                        <Link href={item.path} className={outlineButton}>
                                            {item.buttonText}
                                            <IoArrowForwardOutline
                                                className="ml-[5px] text-secondary group-hover:text-white transition-colors"/>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
