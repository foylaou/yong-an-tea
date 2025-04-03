import Link from 'next/link';
import {JSX} from "react";

import Image from "next/image";
/**
 * 新品項目介面
 *
 * @interface NewArrivalItem
 * @property {string | number} id 商品 ID
 */
interface NewArrivalItem {
    id: string | number;
}

/**
 * 商品資料介面
 *
 * @interface Product
 * @property {string | number} id 商品 ID
 * @property {string} slug 商品網址段
 * @property {string} title 商品標題
 * @property {string} mdImage 中尺寸圖片名稱
 * @property {string} altImage 圖片替代文字
 * @property {number} price 商品價格
 */
interface Product {
    id: string | number;
    slug: string;
    title: string;
    mdImage: string;
    altImage: string;
    price: number;
}

/**
 * NewArrival 組件參數
 *
 * @interface NewArrivalProps
 * @property {string} title 區塊標題
 * @property {string} desc 區塊描述
 * @property {string} path 更多商品連結
 * @property {string} btnText 初始按鈕文字
 * @property {string} readmoreBtnText 閱讀更多按鈕文字
 * @property {Array<{ newArrivalItems: NewArrivalItem[] }>} newArrival 新品資料（含 ID 陣列）
 * @property {Product[]} products 商品資料陣列
 */
interface NewArrivalProps {
    title: string;
    desc: string;
    path: string;
    btnText: string;
    readmoreBtnText: string;
    newArrival: { newArrivalItems: NewArrivalItem[] }[];
    products: Product[];
}

/**
 * NewArrival - 新品上市展示區塊
 *
 * @param {NewArrivalProps} props 組件參數
 * @returns {JSX.Element} 新品展示元件
 */
export default function NewArrival({
                                       title,
                                       desc,
                                       path,
                                       btnText,
                                       readmoreBtnText,
                                       newArrival,
                                       products,
                                   }: NewArrivalProps): JSX.Element {
    return (
        <div className="newarrival-area md:pt-[80px] pt-[50px] md:pb-[80px] sm:pb-[50px]">
            <div className="container">
                <div className="sm:columns-2 columns-1 xl:w-[1145px] mx-auto gap-x-[25px] sm:space-y-[130px] space-y-[30px]">
                    <div className="section-title break-inside-avoid">
                        <h2 className="mb-[30px]">{title}</h2>
                        <p className="mb-[25px]">{desc}</p>
                        <Link
                            href={path}
                            className="underline text-[18px] leading-[18px] transition-all hover:text-primary"
                        >
                            {btnText}
                        </Link>
                    </div>

                    {newArrival[0]?.newArrivalItems?.map((item) => {
                        const product = products.find((p) => p.id === item.id);
                        if (!product) return null;

                        return (
                            <div className="newarrival-item break-inside-avoid" key={item.id}>
                                <div className="product-img">
                                    <Link href={`/products/${product.slug}`}>
                                        <Image
                                            className="w-full"
                                            src={`/images/products/${product.slug}/${product.mdImage}`}
                                            alt={product.altImage}
                                            width={585}
                                            height={585}
                                        />
                                    </Link>
                                </div>
                                <div className="product-content">
                                    <h3 className="mt-[15px] mb-[5px]">
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="transition-all hover:text-primary text-[18px]"
                                        >
                                            {product.title}
                                        </Link>
                                    </h3>
                                    <span className="product-price text-[18px] leading-[31px] text-[#666666]">
                    ${product.price.toFixed(2)}
                  </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="btn-wrap flex justify-center pt-[60px]">
                    <Link
                        href={path}
                        className="underline text-[18px] leading-[18px] transition-all hover:text-primary"
                    >
                        {readmoreBtnText}
                    </Link>
                </div>
            </div>
        </div>
    );
}
