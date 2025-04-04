"use client";
import React, { JSX, useEffect, useRef, useState } from 'react';
import { FilterData, ProductFilterItem } from '@/components/Products/ProductsTypes';
import useRootStore from '@/store/useRootStore';

interface ProductSidebarCompsProps {
    productFilter: ProductFilterItem[];
}

export default function ProductSidebarComps({ productFilter }: ProductSidebarCompsProps): JSX.Element {
    const [fromPrice, setFromPrice] = useState('');
    const [toPrice, setToPrice] = useState('');

    const fromPriceRef = useRef<HTMLInputElement>(null);
    const toPriceRef = useRef<HTMLInputElement>(null);

    const addFilter = useRootStore((state) => state.filter.updateFilter as (data: FilterData[]) => void);
    const removeFilter = useRootStore((state) => state.filter.resetFilter);
    const filterData = useRootStore((state) => state.filter.filterData);

    const textHover = 'transition-all hover:text-primary';
    const swatchColor = 'inline-block w-[20px] h-[20px] rounded-full cursor-pointer';

    const filterChangeHandler = (isAdd: boolean, data: FilterData) => {
        if (isAdd) {
            addFilter?.([data]);
        } else {
            removeFilter?.();
        }
    };

    useEffect(() => {
        if (fromPriceRef.current) {
            fromPriceRef.current.setCustomValidity(parseFloat(fromPrice) >= 0 ? '' : 'Value must be greater than or equal to 0.');
        }
    }, [fromPrice]);

    useEffect(() => {
        if (toPriceRef.current) {
            toPriceRef.current.setCustomValidity(parseFloat(toPrice) >= 0 ? '' : 'Value must be greater than or equal to 0.');
        }
    }, [toPrice]);

    const priceFilterSubmitHandler = (e: React.FormEvent) => {
        e.preventDefault();

        filterChangeHandler(true, {
            title: `$${fromPrice} - $${toPrice}`,
            key: 'priceFilter',
            group: 'priceFilter',
            data: {
                fromPrice: parseFloat(fromPrice),
                toPrice: parseFloat(toPrice),
            },
        });
    };

    return (
        <div className="product-sidebar">
            {/* Categories */}
            <div className="product-sidebar-widget border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">Categories</h2>
                <div className="flex flex-col items-start pt-[20px]">
                    {productFilter[0]?.categoryList?.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="transition-all hover:text-primary capitalize mb-[10px] last:mb-0"
                            onClick={() =>
                                filterChangeHandler(true, {
                                    title: item.categoryListTitle,
                                    key: item.categoryListTitle,
                                    group: 'category',
                                })
                            }
                        >
                            {item.categoryListTitle}
                        </button>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div className="product-sidebar-widget border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">Availability</h2>
                <ul className="flex flex-col pt-[20px]">
                    {productFilter[0]?.availabilityList?.map((item) => (
                        <li className="mb-[10px]" key={item.id}>
                            <label htmlFor={item.filterLabel} className={textHover}>
                                <input
                                    className="mr-[10px]"
                                    type="checkbox"
                                    id={item.filterLabel}
                                    checked={!!filterData.find((data) => data.key === item.key)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        filterChangeHandler(e.target.checked, {
                                            title: item.name,
                                            key: item.key,
                                            group: item.group,
                                        })
                                    }
                                />
                                {item.title}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Size */}
            <div className="product-sidebar-widget border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">Size</h2>
                <ul className="flex flex-col pt-[20px]">
                    {productFilter[0]?.productSizeList?.map((item) => (
                        <li className="mb-[10px]" key={item.id}>
                            <label htmlFor={item.filterLabel} className={textHover}>
                                <input
                                    className="mr-[10px]"
                                    type="checkbox"
                                    id={item.filterLabel}
                                    checked={!!filterData.find((data) => data.key === item.key)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        filterChangeHandler(e.target.checked, {
                                            title: item.name,
                                            key: item.key,
                                            group: item.group,
                                        })
                                    }
                                />
                                {item.title}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price */}
            <div className="product-sidebar-widget border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">Price</h2>
                <form className="price-filter-form pt-[20px]" onSubmit={priceFilterSubmitHandler}>
                    <div className="price-form-field mb-[15px]">
                        <label className="flex mb-[5px]" htmlFor="priceForm">
                            From
                        </label>
                        <div className="flex items-center border border-[#dddddd] px-[10px] h-[45px]">
                            <span className="text-[#777777] pr-[5px]">$</span>
                            <input
                                required
                                ref={fromPriceRef}
                                id="priceForm"
                                value={fromPrice}
                                onChange={(e) => setFromPrice(e.target.value)}
                                type="number"
                                className="w-full focus:outline-none"
                                placeholder="0"
                                min="0"
                                max="90"
                            />
                        </div>
                    </div>
                    <div className="price-form-field">
                        <label className="flex mb-[5px]" htmlFor="priceTo">
                            To
                        </label>
                        <div className="flex items-center border border-[#dddddd] px-[10px] h-[45px]">
                            <span className="text-[#777777] pr-[5px]">$</span>
                            <input
                                required
                                ref={toPriceRef}
                                id="priceTo"
                                value={toPrice}
                                onChange={(e) => setToPrice(e.target.value)}
                                type="number"
                                className="w-full focus:outline-none"
                                placeholder="90"
                                min="0"
                                max="90"
                            />
                        </div>
                    </div>
                    <div className="price-btn-wrap pt-[20px]">
                        <button
                            type="submit"
                            className="flex items-center bg-black text-white px-[25px] py-[8px] h-[40px] transition-all hover:bg-primary"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Color */}
            <div className="product-sidebar-widget border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">Color</h2>
                <ul className="flex flex-wrap pt-[20px]">
                    {productFilter[0]?.colorList?.map((singleColorList) => (
                        <li
                            className="mr-[20px] mb-[6px]"
                            key={singleColorList.id}
                            onClick={() =>
                                filterChangeHandler(true, {
                                    title: singleColorList.colorOption,
                                    key: singleColorList.colorOption,
                                    group: 'color',
                                })
                            }
                        >
                            <span className={`${swatchColor} ${singleColorList.colorOption}`} />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Tags */}
            <div className="product-sidebar-widget">
                <h2 className="widget-title text-[18px]">Tags</h2>
                <div className="flex flex-wrap pt-[20px]">
                    {productFilter[0]?.tagList?.map((singleTagList) => (
                        <button
                            type="button"
                            className={`${textHover} ${singleTagList.marginRight} capitalize after:content-[","] last:after:content-none`}
                            key={singleTagList.id}
                            onClick={() =>
                                filterChangeHandler(true, {
                                    title: singleTagList.tagTitle,
                                    key: singleTagList.tagTitle,
                                    group: 'tag',
                                })
                            }
                        >
                            <span className={`${singleTagList.tagTitle}`}>
                                {singleTagList.tagTitle}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
