"use client";
import Link from 'next/link';
import {Product} from "@/components/Products/ProductsTypes";
import Image from "next/image";

export interface CategoryBannerItem {
    id: string | number;
    CName: string;
}

export interface CategoryBanner {
    categoryBannerItems: CategoryBannerItem[];
}

export interface CategoriesBannerProps {
    products: Product[];
    categoryBanner: CategoryBanner[];
    categoryBannerCName?: string;
}

export default function CategoriesBanner({
                                             products,
                                             categoryBanner,
                                             categoryBannerCName
                                         }: CategoriesBannerProps) {
    return (
        <div className={categoryBannerCName}>
            <div className="container">
                <div className="grid grid-cols-12 md:gap-[10px] gap-y-[15px]">
                    {categoryBanner[0]?.categoryBannerItems?.map(
                        (categoryBannerItem) => (
                            <div
                                className={categoryBannerItem.CName}
                                key={categoryBannerItem.id}
                            >
                                <div className="category-banner-item relative overflow-hidden group">
                                    <div className="product-img">
                                        <Link
                                            href={`/products/${
                                                products.find(
                                                    (item) =>
                                                        item.id ===
                                                        categoryBannerItem.id
                                                )?.slug
                                            }`}
                                        >
                                            <Image
                                                className="w-full transition-all duration-[400ms] group-hover:scale-[1.05]"
                                                src={`/images/products/${
                                                    products.find(
                                                        (item) =>
                                                            item.id ===
                                                            categoryBannerItem.id
                                                    )?.slug
                                                }/${
                                                    products.find(
                                                        (item) =>
                                                            item.id ===
                                                            categoryBannerItem.id
                                                    )?.categoryBannerImg
                                                }`}
                                                alt={
                                                    products.find((item) => item.id === categoryBannerItem.id)?.altImage || ""
                                                }
                                            />
                                        </Link>
                                    </div>
                                    <div className="product-content absolute top-[30px] left-[30px]">
                                        <h3 className="group-hover:text-[#999999]">
                                            <Link
                                                href={`/products/${
                                                    products.find(
                                                        (item) =>
                                                            item.id ===
                                                            categoryBannerItem.id
                                                    )?.slug
                                                }`}
                                                className="transition-all hover:text-primary lg:text-[22px] text-[18px]"
                                            >
                                                {
                                                    products.find(
                                                        (item) =>
                                                            item.id ===
                                                            categoryBannerItem.id
                                                    )?.title
                                                }
                                            </Link>
                                        </h3>
                                        <span className="capitalize font-medium leading-[23px] group-hover:text-primary">
                                            {
                                                products.find(
                                                    (item) =>
                                                        item.id ===
                                                        categoryBannerItem.id
                                                )?.category
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}