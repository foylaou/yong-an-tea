import { useState } from 'react';
import ProductItem from '../Products/ProductItem';
import { MarkdownItem } from '../../types';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface ProductTabProps {
    products: MarkdownItem[];
    containerCName: string;
    productTab: MarkdownItem[];
    tabTitle: string;
    productFilter: MarkdownItem[];
    productFilterPath: string;
}

function ProductTab({
    products: initialProduct,
    containerCName,
    productTab,
    tabTitle,
    productFilter,
    productFilterPath,
}: ProductTabProps) {
    const [products, setProduct] = useState(initialProduct);
    const [currentFilter, setCurrentFilter] = useState('all-products');

    const onFilterHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const { target } = e;
        const filterValue = (target as HTMLButtonElement).dataset.filter;
        setCurrentFilter(filterValue || '');
        const filteredProduct = initialProduct.filter(
            (pro: any) => pro.category === filterValue
        );
        filterValue === 'all-products'
            ? setProduct(initialProduct)
            : setProduct(filteredProduct);
    };

    const btnLoadMore = useSettingsStore((s) => s.btn_load_more);
    const btnAllLoaded = useSettingsStore((s) => s.btn_all_loaded);

    const [noOfElement, setNoOfElement] = useState(4);
    const productSlice = products.slice(0, noOfElement);

    const loadMore = () => {
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
                            {(productTab[0] as any)?.tabList?.map((item: any) => (
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
                    {productSlice.map((product: any) => (
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
                                {btnLoadMore}
                            </button>
                        </div>
                    )}
                    {noOfElement > products.length && (
                        <div className="pt-[85px]">
                            <span>{btnAllLoaded}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductTab;
