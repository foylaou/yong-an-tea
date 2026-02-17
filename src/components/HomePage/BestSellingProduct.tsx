import ProductItem from '../Products/ProductItem';
import SwiperComps, { Slide } from '../SwiperComps';
import { MarkdownItem } from '../../types';

interface BestSellingProductProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    productFilterPath?: string;
    sectionTitle: string;
    settings?: Record<string, any>;
}

function BestSellingProduct({
    products,
    productFilter,
    productFilterPath,
    sectionTitle,
    settings,
}: BestSellingProductProps) {
    settings = {
        spaceBetween: 25,
        pagination: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        loop: false,
        breakpoints: {
            1200: {
                slidesPerView: 4,
            },
            992: {
                slidesPerView: 3,
            },
            576: {
                slidesPerView: 2,
            },
            0: {
                slidesPerView: 1,
            },
        },
    };
    return (
        <div className="best-selling-product xl:pt-[120px] lg:pt-[60px] pt-[5px]">
            <div className="container">
                <div className="section-title text-center pb-[10px] mb-[50px] relative after:bg-primary after:absolute after:left-1/2 after:transform after:-translate-x-1/2 after:bottom-0 after:h-[4px] after:w-[70px]">
                    <h2>{sectionTitle}</h2>
                </div>
                <div className="slider-wrap relative">
                    <SwiperComps settings={settings}>
                        {products.slice(0, 5)?.map((product) => (
                            <Slide key={product.slug}>
                                <ProductItem
                                    product={product}
                                    productFilter={productFilter}
                                    productFilterPath={productFilterPath}
                                />
                            </Slide>
                        ))}
                    </SwiperComps>
                    <div className="swiper-button-wrap">
                        <div className="swiper-button-prev xxl:left-[-40px]! after:text-[24px]! after:text-[#666666]!" />
                        <div className="swiper-button-next xxl:right-[-40px]! after:text-[24px]! after:text-[#666666]!" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BestSellingProduct;
