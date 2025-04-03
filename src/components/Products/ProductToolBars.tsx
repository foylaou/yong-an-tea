import { IoChevronDownSharp } from 'react-icons/io5';

import {Dispatch, JSX, SetStateAction} from "react";
import Image from "next/image";
import {GridTabItems} from "@/components/Products/ProductsTypes";
/**
 * ProductToolBars 元件的 Props
 *
 * @interface ProductToolBarsProps
 * @property {number} totalProductNumber 商品總數
 * @property {number} startItemNumber 當前顯示商品的起始編號
 * @property {number} endItemNumber 當前顯示商品的結束編號
 * @property {number} tabState 當前選中的 Grid 狀態編號
 * @property {(tabState: number) => void} productTab 切換 Grid 狀態的事件處理函式
 * @property {GridTabItems[]} gridTabItems Grid 模式選單列表
 */
interface ProductToolBarsProps {
    totalProductNumber: number;
    startItemNumber: number;
    endItemNumber: number;
    tabState: number;
    productTab: (tabState: number) => void;
    gridTabItems: GridTabItems[];
    setTabState: Dispatch<SetStateAction<number>>;
}

/**
 * ProductToolBars 商品工具列元件
 *
 * @param {ProductToolBarsProps} props 元件參數
 * @returns {JSX.Element} 商品列表上方工具列
 */
export default function ProductToolBars({
                                            totalProductNumber,
                                            startItemNumber,
                                            endItemNumber,
                                            tabState,
                                            gridTabItems,
                                            setTabState
                                        }: ProductToolBarsProps): JSX.Element {
    return (
        <div className="product-toolbar grid grid-cols-12 pb-[25px]">
            <div className="md:col-span-6 sm:col-span-8 col-span-12">
                <div className="left-side flex max-xs:flex-col items-center">
                    <div className="result-count lm:border-black lm:border-r inline-block leading-[12px] lm:pr-[17px]">
                        <p className="max-xs:mb-[10px]">
                            Showing {startItemNumber}-{endItemNumber} of {totalProductNumber}
                        </p>
                    </div>
                    <ul className="sort-item sm:pl-[17px]">
                        <li className="relative group">
              <span className="flex items-center cursor-pointer">
                Sort by: <span className="mx-[5px]">Default</span>
                <IoChevronDownSharp />
              </span>
                            <ul className="sort-subitems bg-white border border-[#dddddd] absolute top-[calc(100%+30px)] sm:left-0 max-xs:left-1/2 max-xs:-translate-x-1/2 w-[210px] p-[10px] transition-all invisible opacity-0 group-hover:top-full group-hover:visible group-hover:opacity-100 z-[9]">
                                {[
                                    'Default sorting',
                                    'Sort by popularity',
                                    'Sort by latest',
                                    'Sort by price: low to high',
                                    'Sort by price: high to low',
                                ].map((label) => (
                                    <li key={label}>
                                        <button
                                            type="button"
                                            className="text-[#777777] text-[15px] leading-[24px] transition-all hover:text-[#222222] py-[5px] px-[10px] rounded-[4px]"
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="md:col-span-6 sm:col-span-4 col-span-12">
                <div className="right-side flex items-center sm:justify-end justify-center pt-[25px] sm:pt-0">
                    <ul className="flex">
                        {gridTabItems[0]?.gridTabList?.map((singleGridTabList) => (
                            <li
                                key={singleGridTabList.id}
                                className={`${
                                    tabState === singleGridTabList.tabStateNo
                                        ? `${singleGridTabList.gridColumns} active opacity-100`
                                        : `${singleGridTabList.gridColumns}`
                                } item opacity-50 cursor-pointer transition-all hover:opacity-100 pr-[17px] last:px-0`}
                                onClick={() => setTabState(singleGridTabList.tabStateNo)}
                            >
                                <Image
                                    src={singleGridTabList.gridColumnImg}
                                    alt={singleGridTabList.gridImgAlt}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
