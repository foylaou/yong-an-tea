import useRootStore from '@/store/useRootStore';
import {useState, MouseEvent, JSX} from 'react';
import ProductItem from './ProductItem';
import ProductSidebarComps from './ProductSidebarComps';
import ProductToolBars from './ProductToolBars';
import ProductActiveFilter from './ProductActiveFilter';
import { FilterDataItem, GridTabItems, Product, ProductFilterItem } from '@/components/Products/ProductsTypes';

interface ProductRightSideBarProps {
    products: Product[];
    productFilter: ProductFilterItem[];
    productFilterPath: string;
    gridTabItems: GridTabItems[];
}

export default function ProductRightSideBar({
                                                products,
                                                productFilter,
                                                productFilterPath,
                                                gridTabItems,
                                            }: ProductRightSideBarProps): JSX.Element {
    const filterData = useRootStore((state) => state.filter.filterData) as FilterDataItem[];

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemPerPage] = useState<number>(9);
    const [pageNumberLimit] = useState<number>(9);
    const [maxPageNumberLimit, setMaxPageNumberLimit] = useState<number>(9);
    const [minPageNumberLimit, setMinPageNumberLimit] = useState<number>(0);
    const [tabState, setTabState] = useState<number>(1);

    const handleClick = (event: MouseEvent<HTMLElement>) => {
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
                filterGroupResult[filter.group] = product[filter.group as keyof typeof product] === filter.key;
            }
        });

        return !Object.values(filterGroupResult).includes(false);
    });

    const pages: number[] = [];
    for (let i = 1; i <= Math.ceil(filteredProduct.length / itemPerPage); i++) {
        pages.push(i);
    }

    const indexOfLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexOfLastItem - itemPerPage;
    const currentItems = filteredProduct.slice(indexOfFirstItem, indexOfLastItem);

    const renderPageNumbers = pages.map((number) => {
        if (number < maxPageNumberLimit + 1 && number > minPageNumberLimit) {
            return (
                <li className="px-[5px]" key={number}>
          <span
              className={`${currentPage === number ? 'active' : ''} bg-[#f5f5f5] cursor-pointer flex items-center px-[13px] h-[34px] text-[12px] font-medium`}
              id={number.toString()}
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
                            startItemNumber={(currentPage - 1) * itemPerPage + 1}
                            endItemNumber={
                                filteredProduct.length > currentPage * itemPerPage
                                    ? currentPage * itemPerPage
                                    : filteredProduct.length
                            }
                            productTab={setTabState}
                            tabState={tabState}
                            setTabState={setTabState}
                            gridTabItems={gridTabItems}
                        />

                        <div className={`grid-content-03 tab-style-common ${tabState === 1 ? 'active' : ''}`}>
                            <div className="grid md:grid-cols-3 lm:grid-cols-2 grid-cols-1 gap-x-[25px] gap-y-[40px]">
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

                        <div className={`grid-content-04 tab-style-common ${tabState === 2 ? 'active' : ''}`}>
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 lm:grid-cols-2 grid-cols-1 gap-x-[25px] gap-y-[40px]">
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

                        <ul className="pagination flex justify-center pt-[40px]">
                            <li className="px-[5px]">
                                <button
                                    className={`${currentPage === pages[0] ? 'hidden' : ''} bg-[#f5f5f5] cursor-pointer flex items-center text-[14px] px-[13px] h-[34px]`}
                                    type="button"
                                    onClick={handlePrevbtn}
                                    disabled={currentPage === pages[0]}
                                >
                                    Prev
                                </button>
                            </li>
                            {minPageNumberLimit >= 1 && <li onClick={handlePrevbtn}>…</li>}
                            {renderPageNumbers}
                            {pages.length > maxPageNumberLimit && <li onClick={handleNextbtn}>…</li>}
                            <li className="px-[5px]">
                                <button
                                    className={`${currentPage === pages[pages.length - 1] ? 'hidden' : ''} bg-[#f5f5f5] cursor-pointer flex items-center text-[14px] px-[13px] h-[34px]`}
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
