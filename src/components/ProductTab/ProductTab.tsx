"use client";
import React, {JSX, useState} from 'react';
import ProductItem from '../Products/ProductItem';
import {Product, ProductFilterItem} from "@/components/Products/ProductsTypes";


interface TabListItem {
    id: number;
    title: string;
    filterValue: string;
}

interface ProductTabProps {
    products: Product[];
    containerCName: string;
    productTab: {
        tabList?: TabListItem[];
    }[];
    tabTitle: string;
    productFilter: ProductFilterItem[];
    productFilterPath: string;
}

export default function ProductTab({
                                       products: initialProduct,
                                       containerCName,
                                       productTab,
                                       tabTitle,
                                       productFilter,
                                       productFilterPath,
                                   }: ProductTabProps): JSX.Element {
    const [products, setProduct] = useState<Product[]>(initialProduct);
    const [currentFilter, setCurrentFilter] = useState<string>('all-products');

    const onFilterHandler = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const target = e.target as HTMLButtonElement;
        const filterValue = target.dataset.filter;
        if (filterValue) {
            setCurrentFilter(filterValue);
            const filteredProduct = initialProduct.filter(
                (pro) => pro.category === filterValue
            );
            if (filterValue === 'all-products') {
                setProduct(initialProduct);
            } else {
                setProduct(filteredProduct);
            }
        }
    };

    const [noOfElement, setNoOfElement] = useState<number>(4);
    const productSlice = products.slice(0, noOfElement);

    const loadMore = (): void => {
        setNoOfElement(noOfElement + noOfElement);
    };

    return (
        <div className="product-tab lg:pt-[95px] md:pt-[75px] pt-[45px]">
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
                <div className="grid grid-cols-12 gap-[25px] md:pt-[80px] pt-[50px]">
                    {productSlice.map((product) => (
                        <div
                            className="lg:col-span-3 md:col-span-4 lm:col-span-6 col-span-12"
                            key={product.slug}
                        >
                            <ProductItem
                                product={product}
                                productFilter={productFilter}
                                productFilterPath={productFilterPath}
                            />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 text-center">
                    {noOfElement < products.length && (
                        <div className="pt-[80px]">
                            <button
                                className="bg-black text-white transition-all hover:bg-primary px-[40px] h-[40px] leading-[40px]"
                                type="button"
                                onClick={loadMore}
                            >
                                Load more
                            </button>
                        </div>
                    )}
                    {noOfElement > products.length && (
                        <div className="pt-[85px]">
                            <span>All item has been loaded!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}