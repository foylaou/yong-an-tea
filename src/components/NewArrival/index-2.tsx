import Link from 'next/link';
import { useMemo } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { MarkdownItem } from '../../types';

interface NewArrivalTwoProps {
    products: MarkdownItem[];
    excerpt: string;
    btnText: string;
}

const cNameMap: Record<number, string> = {
    0: 'newarrival-item-two',
    1: 'newarrival-item-two',
    2: 'newarrival-item-two',
    3: 'newarrival-reverse-item',
};

function NewArrivalTwo({ products, excerpt, btnText }: NewArrivalTwoProps) {
    const newArrivalProducts = useMemo(
        () => products.filter((p) => p.isNewArrival).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        [products]
    );

    if (newArrivalProducts.length === 0) return null;

    return (
        <div className="newarrival-area md:pt-[80px] pt-[50px] sm:pb-[60px]">
            <div className="container-fluid md:px-[100px] px-[15px]">
                <div className="lg:columns-2 columns-1 mx-auto lg:gap-x-[25px] lg:space-y-[100px] md:space-y-[80px] space-y-[50px]">
                    {newArrivalProducts.map((product, index) => (
                        <div
                            className={`${cNameMap[index % 4] ?? 'newarrival-item-two'} break-inside-avoid`}
                            key={product.id}
                        >
                            <div className="product-img overflow-hidden group">
                                <Link href={`/products/${product.slug}`}>
                                    <img
                                        className="transition-all duration-400 group-hover:scale-[1.02]"
                                        src={product.homeCollectionImg}
                                        alt={product.altImage}
                                    />
                                </Link>
                            </div>
                            <div className="product-content relative sm:ml-[80px] ml-[15px] z-1">
                                <h3 className="mb-[30px]">
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="transition-all hover:text-primary md:text-[36px] text-[30px]"
                                    >
                                        {product.title}
                                    </Link>
                                </h3>
                                <p className="lg:max-w-[380px]">
                                    {excerpt}
                                </p>
                                <div className="btn-wrap mt-[60px]">
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="flex items-center transition-all hover:text-primary"
                                    >
                                        {btnText}
                                        <IoArrowForwardOutline className="light-stroke text-[18px] ml-[5px]" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NewArrivalTwo;
