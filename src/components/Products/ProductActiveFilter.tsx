"use client";
import { IoCloseOutline } from 'react-icons/io5';
import { JSX } from "react";

import useRootStore from '@/store/useRootStore';

// 如果你未來會用 props，可保留 interface，否則直接刪除


export default function ProductActiveFilter(): JSX.Element {
    const { filterData, updateFilter, resetFilter } = useRootStore((state) => state.filter);

    const handleRemoveFilter = (keyToRemove: string) => {
        const updatedFilter = filterData.filter((item) => item.key !== keyToRemove);
        updateFilter({ filterData: updatedFilter });
    };

    return (
        <ul className="active-filter-list flex flex-wrap items-center pb-[20px] -mb-[10px]">
            {filterData.map((item) => (
                <li className="mr-[10px] mb-[10px]" key={item.key}>
                    <button
                        type="button"
                        className="bg-[#e8e8e8] flex items-center text-[14px] px-[10px] rounded-[20px] transition-all hover:bg-black hover:text-white"
                    >
                        <span className="mr-[5px]">{item.key}</span>
                        <IoCloseOutline
                            className="cursor-pointer"
                            onClick={() => handleRemoveFilter(item.key)}
                        />
                    </button>
                </li>
            ))}

            {filterData.length !== 0 && (
                <li className="mb-[10px]">
                    <button
                        onClick={resetFilter}
                        type="button"
                        className="clear-btn text-[14px] transition-all hover:text-primary"
                    >
                        Clear All
                    </button>
                </li>
            )}
        </ul>
    );
}
