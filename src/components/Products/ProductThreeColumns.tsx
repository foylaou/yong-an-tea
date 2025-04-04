"use client";
import React, { JSX, useState } from 'react';
import {FilterDataItem, GridTabItems, Product, ProductFilterItem} from "@/components/Products/ProductsTypes";
import ProductToolBars from "@/components/Products/ProductToolBars";
import ProductActiveFilter from "@/components/Products/ProductActiveFilter";
import ProductItem from "@/components/Products/ProductItem";
import useRootStore from '@/store/useRootStore';

interface ProductThreeColumnsProps {
    products: Product[];
    gridTabItems: GridTabItems[];
    productFilter: ProductFilterItem[];
    productFilterPath: string;
}

export default function ProductThreeColumns({
                                                products,
                                                gridTabItems,
                                                productFilter,
                                                productFilterPath,
                                            }: ProductThreeColumnsProps): JSX.Element {
    const filterData = useRootStore((state) => state.filter.filterData) as FilterDataItem[];

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage] = useState(9);
    const [pageNumberLimit] = useState(9);
    const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(9);
    const [minPageNumberLimit, setMinPageNumberLimit] = useState(0);
    const [tabState, setTabState] = useState(1);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setCurrentPage(Number((event.target as HTMLElement).id));
    };

    const filteredProduct = products.filter((product) => {
        const filterGroupResult: Record<string, boolean> = {};

        filterData.forEach((filter) => {
            if (filter.key === 'priceFilter' && filter.data) {
                filterGroupResult[filter.group] =
                    filter.data.fromPrice <= product.price &&
                    product.price <= filter.data.toPrice;
            } else if (!filterGroupResult[filter.group]) {
                filterGroupResult[filter.group] =
                    product[filter.group as keyof typeof product] === filter.key;
            }
        });

        return !Object.values(filterGroupResult).includes(false);
    });

    const pages = [];
    for (let i = 1; i <= Math.ceil(filteredProduct.length / itemPerPage); i++) {
        pages.push(i);
    }

    const indexofLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexofLastItem - itemPerPage;
    const currentItems = filteredProduct.slice(indexOfFirstItem, indexofLastItem);

    const renderPageNumbers = pages.map((number) => {
        if (number < maxPageNumberLimit + 1 && number > minPageNumberLimit) {
            return (
                <li className="px-[5px]" key={number}>
          <span
              className={`${
                  currentPage === number ? 'active' : ''
              } bg-[#f5f5f5] cursor-pointer flex items-center px-[13px] h-[34px] text-[12px] font-medium`}
              id={String(number)}
              onClick={handleClick}
          >
            {number}
          </span>
                </li>
            );
        }
        return null;
    });

    const handleNextbtn = () => {
        setCurrentPage((prev) => prev + 1);
        if (currentPage + 1 > maxPageNumberLimit) {
            setMaxPageNumberLimit((prev) => prev + pageNumberLimit);
            setMinPageNumberLimit((prev) => prev + pageNumberLimit);
        }
    };

    const handlePrevbtn = () => {
        setCurrentPage((prev) => prev - 1);
        if ((currentPage - 1) % pageNumberLimit === 0) {
            setMaxPageNumberLimit((prev) => prev - pageNumberLimit);
            setMinPageNumberLimit((prev) => prev - pageNumberLimit);
        }
    };

    const pageIncrementBtn =
        pages.length > maxPageNumberLimit ? <li onClick={handleNextbtn}>&hellip;</li> : null;

    const pageDecrementBtn =
        minPageNumberLimit >= 1 ? <li onClick={handlePrevbtn}>&hellip;</li> : null;

    const productTab = (index: number): void => {
        setTabState(index);
    };

    return (
        <div className="product border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container">
                <div className="grid grid-cols-12 lg:gap-x-[25px]">
                    <div className="col-span-12">
                        <ProductActiveFilter />
                        <ProductToolBars
                            setTabState={setTabState}
                            totalProductNumber={filteredProduct.length}
                            startItemNumber={(currentPage - 1) * itemPerPage + 1}
                            endItemNumber={
                                filteredProduct.length > currentPage * itemPerPage
                                    ? currentPage * itemPerPage
                                    : filteredProduct.length
                            }
                            productTab={productTab}
                            tabState={tabState}
                            gridTabItems={gridTabItems}
                        />

                        {[1, 2, 3].map((state) => (
                            <div
                                key={state}
                                className={`grid-content-0${state + 2} tab-style-common${
                                    tabState === state ? ' active' : ''
                                }`}
                            >
                                <div
                                    className={`${
                                        state === 1
                                            ? 'grid md:grid-cols-3 lm:grid-cols-2 grid-cols-1'
                                            : state === 2
                                                ? 'grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1'
                                                : 'grid lg:grid-cols-5 md:grid-cols-4 lm:grid-cols-3 sm:grid-cols-2 grid-cols-1'
                                    } sm:gap-x-[25px] gap-y-[40px]`}
                                >
                                    {currentItems.map((product) => (
                                        <ProductItem
                                            product={product}
                                            productFilter={productFilter}
                                            productFilterPath={productFilterPath}
                                            key={product.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        <ul className="pagination flex justify-center pt-[40px]">
                            <li className="px-[5px]">
                                <button
                                    className={`${
                                        currentPage === pages[0] ? 'hidden' : ''
                                    } bg-[#f5f5f5] cursor-pointer flex items-center text-[14px] px-[13px] h-[34px]`}
                                    type="button"
                                    onClick={handlePrevbtn}
                                    disabled={currentPage === pages[0]}
                                >
                                    Prev
                                </button>
                            </li>
                            {pageDecrementBtn}
                            {renderPageNumbers}
                            {pageIncrementBtn}
                            <li className="px-[5px]">
                                <button
                                    className={`${
                                        currentPage === pages[pages.length - 1] ? 'hidden' : ''
                                    } bg-[#f5f5f5] cursor-pointer flex items-center text-[14px] px-[13px] h-[34px]`}
                                    type="button"
                                    onClick={handleNextbtn}
                                    disabled={currentPage === pages[pages.length - 1]}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
