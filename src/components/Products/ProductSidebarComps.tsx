import { useState, useRef, useEffect } from 'react';
import { useFilterStore } from '../../store/product-filter/filter-slice';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { MarkdownItem } from '../../types';

const textHover = `transition-all hover:text-primary`;

interface ProductSidebarCompsProps {
    productFilter: MarkdownItem[];
}

function ProductSidebarComps({ productFilter }: ProductSidebarCompsProps) {
    const [fromPrice, setFromPrice] = useState('');
    const [toPrice, setToPrice] = useState('');

    const fromPriceRef = useRef<HTMLInputElement>(null);
    const toPriceRef = useRef<HTMLInputElement>(null);

    const filter = useFilterStore();
    const currencySymbol = useSettingsStore((s) => s.currency_symbol);

    const filterChangeHandler = (isAdd: boolean, data: any) => {
        if (isAdd) {
            useFilterStore.getState().addFilter(data);
        } else {
            useFilterStore.getState().removeFilter(data);
        }
    };

    useEffect(() => {
        // price validation
        if (Number(fromPrice) >= 0) {
            // there is no issue
            fromPriceRef.current?.setCustomValidity('');
        } else {
            // price is lower then zero.
            fromPriceRef.current?.setCustomValidity(
                'Value must be greater than or equal to 0.'
            );
        }
    }, [fromPrice, fromPriceRef]);

    useEffect(() => {
        // price validation
        if (Number(toPrice) >= 0) {
            // there is no issue
            toPriceRef.current?.setCustomValidity('');
        } else {
            // price is lower then zero.
            toPriceRef.current?.setCustomValidity(
                'Value must be greater than or equal to 0.'
            );
        }
    }, [toPrice, toPriceRef]);

    const priceFilterSubmitHandler = (e: React.FormEvent) => {
        e.preventDefault();

        filterChangeHandler(true, {
            title: `${currencySymbol}${fromPrice} - ${currencySymbol}${toPrice}`,
            key: 'priceFilter',
            group: 'priceFilter',
            data: {
                fromPrice,
                toPrice,
            },
        });
    };

    return (
        <div className="product-sidebar">
            <div className="product-sidebar-widget border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">分類</h2>
                <div className="flex flex-col items-start pt-[20px]">
                    {(productFilter[0] as any)?.categoryList?.map(
                        (singleCategoryList: any) => (
                            <button
                                type="button"
                                className={`${textHover} capitalize mb-[10px] last:mb-0`}
                                key={singleCategoryList.id}
                                onClick={() =>
                                    filterChangeHandler(true, {
                                        title: singleCategoryList.categoryListTitle,
                                        key: singleCategoryList.categorySlug,
                                        group: 'category',
                                    })
                                }
                            >
                                {singleCategoryList.categoryListTitle}
                            </button>
                        )
                    )}
                </div>
            </div>
            <div className="product-sidebar-widget border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">庫存狀態</h2>
                <ul className="flex flex-col pt-[20px]">
                    {(productFilter[0] as any)?.availabilityList?.map((item: any) => (
                        <li className="mb-[10px]" key={item.id}>
                            <label
                                htmlFor={item.filterLabel}
                                className={`${textHover}`}
                            >
                                <input
                                    className="mr-[10px]"
                                    type="checkbox"
                                    id={item.filterLabel}
                                    checked={
                                        !!filter.filterData.find(
                                            (data: any) => data.key === item.checked
                                        )
                                    }
                                    onChange={(data) =>
                                        filterChangeHandler(
                                            data.target.checked,
                                            {
                                                title: item.name,
                                                key: item.key,
                                                group: item.group,
                                            }
                                        )
                                    }
                                />
                                {item.title}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="product-sidebar-widge border-b border-[#dddddd] pb-[30px] mb-[25px]">
                <h2 className="widget-title text-[18px]">價格</h2>
                <form
                    className="price-filter-form pt-[20px]"
                    onSubmit={priceFilterSubmitHandler}
                >
                    <div className="price-form-field mb-[15px]">
                        <label className="flex mb-[5px]" htmlFor="priceForm">
                            從
                        </label>
                        <div className="flex items-center border border-[#dddddd] px-[10px] h-[45px]">
                            <span className="text-[#777777] pr-[5px]">{currencySymbol}</span>
                            <input
                                required
                                ref={fromPriceRef}
                                id="priceForm"
                                value={fromPrice}
                                onChange={(e) => setFromPrice(e.target.value)}
                                type="number"
                                className="w-full focus:outline-hidden"
                                placeholder="0"
                                min="0"
                                max="90"
                            />
                        </div>
                    </div>
                    <div className="price-form-field">
                        <label className="flex mb-[5px]" htmlFor="priceTo">
                            到
                        </label>
                        <div className="flex items-center border border-[#dddddd] px-[10px] h-[45px]">
                            <span className="text-[#777777] pr-[5px]">{currencySymbol}</span>
                            <input
                                required
                                ref={toPriceRef}
                                id="priceTo"
                                value={toPrice}
                                onChange={(e) => setToPrice(e.target.value)}
                                type="number"
                                className="w-full focus:outline-hidden"
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
                            篩選
                        </button>
                    </div>
                </form>
            </div>
            <div className="product-sidebar-widget">
                <h2 className="widget-title text-[18px]">標籤</h2>
                <div className="flex flex-wrap pt-[20px]">
                    {(productFilter[0] as any)?.tagList?.map((singleTagList: any) => (
                        <button
                            type="button"
                            className={`${textHover} ${singleTagList.marginRight} capitalize after:content-[","] last:after:content-none`}
                            key={singleTagList.id}
                            onClick={() =>
                                filterChangeHandler(true, {
                                    title: singleTagList.tagTitle,
                                    key: singleTagList.tagSlug,
                                    group: 'tag',
                                })
                            }
                        >
                            {singleTagList.tagTitle}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProductSidebarComps;
