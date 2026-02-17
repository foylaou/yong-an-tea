import Link from 'next/link';
import { useMemo } from 'react';
import { MarkdownItem } from '../../types';

interface CategoriesBannerProps {
    products: MarkdownItem[];
    categoryBannerCName?: string;
}

// Grid column pattern: [3, 6, 3, 6, 6] repeating
// Using lookup map to avoid Tailwind dynamic class purge issues
const gridClassMap: Record<number, string> = {
    0: 'md:col-span-3 col-span-12',
    1: 'md:col-span-6 col-span-12',
    2: 'md:col-span-3 col-span-12',
    3: 'md:col-span-6 col-span-12',
    4: 'md:col-span-6 col-span-12',
};

function CategoriesBanner({ products, categoryBannerCName }: CategoriesBannerProps) {
    const bannerProducts = useMemo(
        () => products
            .filter((p) => p.showInBanner)
            .sort((a, b) => (a.bannerOrder ?? 0) - (b.bannerOrder ?? 0)),
        [products]
    );

    if (bannerProducts.length === 0) return null;

    return (
        <div className={categoryBannerCName}>
            <div className="container">
                <div className="grid grid-cols-12 md:gap-[10px] gap-y-[15px]">
                    {bannerProducts.map((product, index) => (
                        <div
                            className={gridClassMap[index % 5] ?? 'md:col-span-6 col-span-12'}
                            key={product.id}
                        >
                            <div className="category-banner-item relative overflow-hidden group">
                                <div className="product-img">
                                    <Link href={`/products/${product.slug}`}>
                                        <img
                                            className="w-full transition-all duration-400 group-hover:scale-[1.05]"
                                            src={product.categoryBannerImg}
                                            alt={product.altImage}
                                        />
                                    </Link>
                                </div>
                                <div className="product-content absolute top-[30px] left-[30px]">
                                    <h3 className="group-hover:text-[#999999]">
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="transition-all hover:text-primary lg:text-[22px] text-[18px]"
                                        >
                                            {product.title}
                                        </Link>
                                    </h3>
                                    <span className="capitalize font-medium leading-[23px] group-hover:text-primary">
                                        {product.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CategoriesBanner;
