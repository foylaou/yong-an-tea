import { useState, useEffect } from 'react';
import ProductItem from './ProductItem';
import ProductSidebarComps from './ProductSidebarComps';
import ProductToolBars from './ProductToolBars';
import ProductActiveFilter from './ProductActiveFilter';
import { useFilterStore } from '../../store/product-filter/filter-slice';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { MarkdownItem } from '../../types';

interface ProductRightSideBarProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    productFilterPath?: string;
    gridTabKey: 'grid_tab_2col_json' | 'grid_tab_3col_json' | 'grid_tab_3col_alt_json';
}

function ProductRightSideBar({
    products,
    productFilter,
    productFilterPath,
    gridTabKey,
}: ProductRightSideBarProps) {
    const { filterData } = useFilterStore();
    const productsPerPage = useSettingsStore((s) => s.products_per_page);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setitemPerPage] = useState(productsPerPage);

    useEffect(() => {
        setitemPerPage(productsPerPage);
    }, [productsPerPage]);

    const [pageNumberLimit, setPageNumberLimit] = useState(9);
    const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(9);
    const [minPageNumberLimit, setMinPageNumberLimit] = useState(0);

    const handleClick = (event: any) => {
        setCurrentPage(Number(event.target.id));
    };

    const filteredProduct = products.filter((singleProduct: any) => {
        const filterGroupResult: Record<string, boolean> = {};

        filterData.forEach((singleFilterData: any) => {
            if (singleFilterData.key === 'priceFilter') {
                filterGroupResult[singleFilterData.group] =
                    singleFilterData.data.fromPrice <= singleProduct.price &&
                    singleProduct.price <= singleFilterData.data.toPrice;
            } else if (!filterGroupResult[singleFilterData.group]) {
                filterGroupResult[singleFilterData.group] =
                    singleProduct[singleFilterData.group] ===
                    singleFilterData.key;
            }
        });

        return !Object.values(filterGroupResult).includes(false);
    });

    const pages: number[] = [];
    for (let i = 1; i <= Math.ceil(filteredProduct.length / itemPerPage); i++) {
        pages.push(i);
    }

    const indexofLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexofLastItem - itemPerPage;
    const currentItems = filteredProduct.slice(
        indexOfFirstItem,
        indexofLastItem
    );

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
        setCurrentPage(currentPage + 1);

        if (currentPage + 1 > maxPageNumberLimit) {
            setMaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit);
            setMinPageNumberLimit(minPageNumberLimit + pageNumberLimit);
        }
    };
    const handlePrevbtn = () => {
        setCurrentPage(currentPage - 1);

        if ((currentPage - 1) % maxPageNumberLimit === 0) {
            setMaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit);
            setMinPageNumberLimit(minPageNumberLimit - pageNumberLimit);
        }
    };

    let pageIncrementBtn: React.ReactNode = null;
    if (pages.length > maxPageNumberLimit) {
        pageIncrementBtn = <li onClick={handleNextbtn}>&hellip;</li>;
    }

    let pageDecrementBtn: React.ReactNode = null;
    if (minPageNumberLimit >= 1) {
        pageDecrementBtn = <li onClick={handlePrevbtn}>&hellip;</li>;
    }

    // Tab
    const [tabState, setTabState] = useState(1);
    const productTab = (index: number) => {
        setTabState(index);
    };

    return (
        <div className="product border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container">
                <div className="grid grid-cols-12 lg:gap-x-[25px] max-md:gap-y-[45px]">
                    <div className="lg:col-span-3 col-span-12 order-2">
                        <ProductSidebarComps productFilter={productFilter} />
                    </div>
                    <div className="lg:col-span-9 col-span-12 order-1">
                        <ProductActiveFilter />
                        <ProductToolBars
                            totalProductNumber={filteredProduct.length}
                            startItemNumber={
                                (currentPage - 1) * itemPerPage + 1
                            }
                            endItemNumber={
                                filteredProduct.length >
                                currentPage * itemPerPage
                                    ? currentPage * itemPerPage
                                    : filteredProduct.length
                            }
                            productTab={productTab}
                            tabState={tabState}
                            setTabState={setTabState}
                            gridTabKey={gridTabKey}
                        />

                        <div
                            className={
                                tabState === 1
                                    ? 'grid-content-03 tab-style-common active'
                                    : 'grid-content-03 tab-style-common'
                            }
                        >
                            <div className="grid md:grid-cols-3 lm:grid-cols-2 grid-cols-1 gap-x-[25px] gap-y-[40px]">
                                {currentItems &&
                                    currentItems.map((product: any) => (
                                        <ProductItem
                                            product={product}
                                            productFilter={productFilter}
                                            productFilterPath={
                                                productFilterPath
                                            }
                                            key={product.id}
                                        />
                                    ))}
                            </div>
                        </div>
                        <div
                            className={
                                tabState === 2
                                    ? 'grid-content-04 tab-style-common active'
                                    : 'grid-content-04 tab-style-common'
                            }
                        >
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 lm:grid-cols-2 grid-cols-1 gap-x-[25px] gap-y-[40px]">
                                {currentItems &&
                                    currentItems.map((product: any) => (
                                        <ProductItem
                                            productFilter={productFilter}
                                            product={product}
                                            productFilterPath={
                                                productFilterPath
                                            }
                                            key={product.id}
                                        />
                                    ))}
                            </div>
                        </div>
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
                                    上一頁
                                </button>
                            </li>
                            {pageDecrementBtn}
                            {renderPageNumbers}
                            {pageIncrementBtn}
                            <li className="px-[5px]">
                                <button
                                    className={`${
                                        currentPage === pages[pages.length - 1]
                                            ? 'hidden'
                                            : ''
                                    } bg-[#f5f5f5] cursor-pointer flex items-center text-[14px] px-[13px] h-[34px]`}
                                    type="button"
                                    onClick={handleNextbtn}
                                    disabled={
                                        currentPage === pages[pages.length - 1]
                                    }
                                >
                                    下一頁
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductRightSideBar;
