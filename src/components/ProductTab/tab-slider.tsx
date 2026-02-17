import { useState } from 'react';
import dynamic from 'next/dynamic';
import ProductItem from '../Products/ProductItem';
import { Slide } from '../SwiperComps';
import { MarkdownItem } from '../../types';

type SwiperSettings = Record<string, any>;

interface ProductTabSliderProps {
    products: MarkdownItem[];
    containerCName: string;
    productTab: MarkdownItem[];
    tabTitle: string;
    productFilter: MarkdownItem[];
    productFilterPath: string;
    settings?: SwiperSettings;
}

function ProductTabSlider({
    products: initialProduct,
    containerCName,
    productTab,
    tabTitle,
    productFilter,
    productFilterPath,
    settings,
}: ProductTabSliderProps) {
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

    const SwiperComps = dynamic(() => import('../SwiperComps'), {
        ssr: false,
    });
    settings = {
        pagination: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        spaceBetween: 30,
        loop: true,
        breakpoints: {
            0: {
                slidesPerView: 2,
            },
            576: {
                slidesPerView: 3,
            },
            768: {
                slidesPerView: 4,
            },
            992: {
                slidesPerView: 4,
            },
        },
    };

    return (
        <div className="product-tab-slider pt-[125px]">
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
                <div className="slider-wrap relative pt-[25px]">
                    <SwiperComps settings={settings}>
                        {products?.map((product: any) => (
                            <Slide key={product.id}>
                                <ProductItem
                                    product={product}
                                    productFilter={productFilter}
                                    productFilterPath={productFilterPath}
                                />
                            </Slide>
                        ))}
                    </SwiperComps>
                </div>
            </div>
        </div>
    );
}

export default ProductTabSlider;
