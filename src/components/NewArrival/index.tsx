import Link from 'next/link';
import { useMemo } from 'react';
import { formatPrice } from '../../store/settings/settings-slice';
import { MarkdownItem } from '../../types';

interface NewArrivalProps {
    title: string;
    desc: string;
    path: string;
    btnText: string;
    readmoreBtnText: string;
    products: MarkdownItem[];
}

function NewArrival({
    title,
    desc,
    path,
    btnText,
    readmoreBtnText,
    products,
}: NewArrivalProps) {
    const newArrivalProducts = useMemo(
        () => products.filter((p) => p.isNewArrival).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        [products]
    );

    if (newArrivalProducts.length === 0) return null;

    return (
        <div className="newarrival-area md:pt-[80px] pt-[50px] md:pb-[80px] sm:pb-[50px]">
            <div className="container">
                <div className="sm:columns-2 columns-1 xl:w-[1145px] mx-auto gap-x-[25px] sm:space-y-[130px] space-y-[30px]">
                    <div className="section-title break-inside-avoid">
                        <h2 className="mb-[30px]">{title}</h2>
                        <p className="mb-[25px]">{desc}</p>
                        <Link
                            href={path}
                            className="underline text-[18px] leading-[18px] transition-all hover:text-primary"
                        >
                            {btnText}
                        </Link>
                    </div>
                    {newArrivalProducts.map((product) => (
                        <div
                            className="newarrival-item break-inside-avoid"
                            key={product.id}
                        >
                            <div className="product-img">
                                <Link href={`/products/${product.slug}`}>
                                    <img
                                        className="w-full"
                                        src={product.mdImage}
                                        alt={product.altImage}
                                        width={585}
                                        height={585}
                                    />
                                </Link>
                            </div>
                            <div className="product-content">
                                <h3 className="mt-[15px] mb-[5px]">
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="transition-all hover:text-primary text-[18px]"
                                    >
                                        {product.title}
                                    </Link>
                                </h3>
                                <span className="product-price text-[18px] leading-[31px] text-[#666666]">
                                    {formatPrice(product.price ?? 0)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="btn-wrap flex justify-center pt-[60px]">
                    <Link
                        href={path}
                        className="underline text-[18px] leading-[18px] transition-all hover:text-primary"
                    >
                        {readmoreBtnText}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NewArrival;
