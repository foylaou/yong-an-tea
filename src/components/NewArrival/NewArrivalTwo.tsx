"use client";
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';
import {JSX} from "react";
import Image from "next/image";


/**
 * 單一新品項目資料
 *
 * @interface NewArrivalItemTwo
 * @property {string | number} id 商品 ID
 * @property {string} CName CSS class 名稱
 */
interface NewArrivalItemTwo {
    id: string | number;
    CName: string;
}

/**
 * 商品資料型別
 *
 * @interface Product
 * @property {string | number} id 商品 ID
 * @property {string} slug 商品網址段
 * @property {string} title 商品標題
 * @property {string} homeCollectionImg 商品圖檔名稱
 * @property {string} altImage 圖片替代文字
 */
interface Product {
    id: string | number;
    slug: string;
    title: string;
    homeCollectionImg: string;
    altImage: string;
}

/**
 * NewArrivalTwo 組件參數
 *
 * @interface NewArrivalTwoProps
 * @property {{ newArrivalItemsTwo: NewArrivalItemTwo[] }[]} newArrivalTwo 新品項目集合
 * @property {Product[]} products 商品資料陣列
 * @property {string} excerpt 商品說明文字
 * @property {string} btnText 按鈕文字
 */
interface NewArrivalTwoProps {
    newArrivalTwo: { newArrivalItemsTwo: NewArrivalItemTwo[] }[];
    products: Product[];
    excerpt: string;
    btnText: string;
}

/**
 * NewArrivalTwo - 雙欄新品展示區塊
 *
 * @param {NewArrivalTwoProps} props 組件參數
 * @returns {JSX.Element} 新品展示元件
 */
export default function NewArrivalTwo({
                                          newArrivalTwo,
                                          products,
                                          excerpt,
                                          btnText,
                                      }: NewArrivalTwoProps): JSX.Element {
    return (
        <div className="newarrival-area md:pt-[80px] pt-[50px] sm:pb-[60px]">
            <div className="container-fluid md:px-[100px] px-[15px]">
                <div className="lg:columns-2 columns-1 mx-auto lg:gap-x-[25px] lg:space-y-[100px] md:space-y-[80px] space-y-[50px]">
                    {newArrivalTwo[0]?.newArrivalItemsTwo?.map((item) => {
                        const product = products.find((p) => p.id === item.id);
                        if (!product) return null;

                        return (
                            <div className={`${item.CName} break-inside-avoid`} key={item.id}>
                                <div className="product-img overflow-hidden group">
                                    <Link href={`/products/${product.slug}`}>
                                        <Image
                                            className="transition-all duration-[400ms] group-hover:scale-[1.02]"
                                            src={`/images/products/${product.slug}/${product.homeCollectionImg}`}
                                            alt={product.altImage}
                                        />
                                    </Link>
                                </div>
                                <div className="product-content relative sm:ml-[80px] ml-[15px] z-[1]">
                                    <h3 className="mb-[30px]">
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="transition-all hover:text-primary md:text-[36px] text-[30px]"
                                        >
                                            {product.title}
                                        </Link>
                                    </h3>
                                    <p className="lg:max-w-[380px]">{excerpt}</p>
                                    <div className="btn-wrap mt-[60px]">
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="flex items-center transition-all hover:text-primary"
                                        >
                                            {btnText}
                                            <IoArrowForwardOutline className="light-stroke text-[18px] ml-[5px]" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
