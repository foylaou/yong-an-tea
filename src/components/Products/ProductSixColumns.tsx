
import { useState, MouseEvent } from 'react';

import ProductToolBars from './ProductToolBars';
import {FilterDataItem, GridTabItems, Product, ProductFilterItem} from "@/components/Products/ProductsTypes";



/**
 * ProductSixColumns 組件參數
 */
interface ProductSixColumnsProps {
    products: Product[];
    gridTabItems: GridTabItems[];
    productSixColumnsContainer?: string;
    productFilter: ProductFilterItem[];
    productFilterPath: string;

}

export default function ProductSixColumns({
                                              products,
                                              gridTabItems,
                                              productSixColumnsContainer = 'container',
                                              productFilter,
                                              productFilterPath,
                                          }: ProductSixColumnsProps) {
    const { filterData }: { filterData: FilterDataItem[] } = useSelector(
        (state: { filter: { filterData: FilterDataItem[] } }) => state.filter
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage] = useState(9);
    const [pageNumberLimit] = useState(9);
    const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(9);
    const [minPageNumberLimit, setMinPageNumberLimit] = useState(0);
    const [tabState, setTabState] = useState(3);

    const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        setCurrentPage(Number(event.currentTarget.id));
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

    const pages = Array.from({
        length: Math.ceil(filteredProduct.length / itemPerPage),
    }).map((_, i) => i + 1);

    const indexOfLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexOfLastItem - itemPerPage;
    const currentItems = filteredProduct.slice(indexOfFirstItem, indexOfLastItem);

    const renderPageNumbers = pages.map((number) => {
        if (number < maxPageNumberLimit + 1 && number > minPageNumberLimit) {
            return (
                <li className="px-[5px]" key={number}>
          <span
              id={number.toString()}
              className={`${
                  currentPage === number ? 'active' : ''
              } bg-[#f5f5f5] cursor-pointer flex items-center px-[13px] h-[34px] text-[12px] font-medium`}
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

    const productTab = (index: number) => {
        setTabState(index);
    };

    return (
        <div className="product border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className={productSixColumnsContainer}>
                <div className="grid grid-cols-12 lg:gap-x-[25px]">
                    <div className="col-span-12">
                        <ProductActiveFilter />
                        <ProductToolBars
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

                        {/* 4 Columns */}
                        <div
                            className={`grid-content-04 tab-style-common ${
                                tabState === 1 ? 'active' : ''
                            }`}
                        >
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 sm:gap-x-[25px] gap-y-[40px]">
                                {currentItems.map((product) => (
                                    <ProductItem
                                        key={product.id}
                                        product={product}
                                        productFilter={productFilter}
                                        productFilterPath={productFilterPath}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 5 Columns */}
                        <div
                            className={`grid-content-05 tab-style-common ${
                                tabState === 2 ? 'active' : ''
                            }`}
                        >
                            <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2 grid-cols-1 sm:gap-x-[25px] gap-y-[40px]">
                                {currentItems.map((product) => (
                                    <ProductItem
                                        key={product.id}
                                        product={product}
                                        productFilter={productFilter}
                                        productFilterPath={productFilterPath}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 6 Columns */}
                        <div
                            className={`grid-content-06 tab-style-common ${
                                tabState === 3 ? 'active' : ''
                            }`}
                        >
                            <div className="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2 grid-cols-1 sm:gap-x-[25px] gap-y-[40px]">
                                {currentItems.map((product) => (
                                    <ProductItem
                                        key={product.id}
                                        product={product}
                                        productFilter={productFilter}
                                        productFilterPath={productFilterPath}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 分頁 */}
                        <ul className="pagination flex justify-center pt-[40px]">
                            <li className="px-[5px]">
                                <button
                                    className={`${
                                        currentPage === pages[0] ? 'hidden' : ''
                                    } bg-[#f5f5f5] text-[14px] px-[13px] h-[34px]`}
                                    onClick={handlePrevbtn}
                                >
                                    Prev
                                </button>
                            </li>
                            {minPageNumberLimit >= 1 && <li onClick={handlePrevbtn}>…</li>}
                            {renderPageNumbers}
                            {pages.length > maxPageNumberLimit && (
                                <li onClick={handleNextbtn}>…</li>
                            )}
                            <li className="px-[5px]">
                                <button
                                    className={`${
                                        currentPage === pages[pages.length - 1] ? 'hidden' : ''
                                    } bg-[#f5f5f5] text-[14px] px-[13px] h-[34px]`}
                                    onClick={handleNextbtn}
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
