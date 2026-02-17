import Link from 'next/link';
import { useMemo } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface FeaturedBlock {
    id: string;
    subTitle: string;
    title: string;
    excerpt: string;
    image: string;
    altImage: string;
    path: string;
    buttonText: string;
    bgLabel: string;
}

function FeaturedProduct() {
    const featuredProductsJson = useSettingsStore((s) => s.featured_products_json);
    const blocks: FeaturedBlock[] = useMemo(() => {
        try { return JSON.parse(featuredProductsJson); } catch { return []; }
    }, [featuredProductsJson]);

    const outlineButton =
        'inline-flex items-center border border-secondary text-secondary transition-all hover:bg-secondary hover:text-white leading-[38px] text-[15px] h-[38px] px-[35px]';

    if (blocks.length === 0) return null;

    return (
        <>
            {blocks.map((block, index) => {
                const isReversed = index % 2 === 1;
                const isLast = index === blocks.length - 1;
                const href = block.path || '/';

                return (
                    <div
                        key={block.id || index}
                        className={`featured-product ${index === 0 ? 'xl:pt-[120px] lg:pt-[100px] md:pt-[80px] pt-[50px]' : 'xl:pt-[135px] lg:pt-[115px] md:pt-[95px] pt-[65px]'} ${isLast ? 'xl:pb-[110px] lg:pb-[90px] pb-[60px]' : ''} relative before:content-[attr(data-count)] before:absolute before:text-[#F5F4F7] before:font-semibold xl:before:text-[80px] before:text-[40px] ${isReversed ? 'before:bottom-[-75px] before:left-0' : 'before:bottom-[-15px] before:right-0'} before:z-1`}
                        data-count={block.bgLabel ?? ''}
                    >
                        <div className="container">
                            <div className="grid md:grid-cols-2 grid-cols-12 lm:gap-x-[30px] md:gap-y-0 gap-y-[30px] group">
                                <div className={`md:col-span-1 col-span-12 ${isReversed ? 'order-2' : ''}`}>
                                    <Link
                                        href={href}
                                        className="featured-product-img block transition-all duration-500 group-hover:scale-[1.05]"
                                    >
                                        {block.image && (
                                            <img
                                                src={block.image}
                                                alt={block.altImage}
                                            />
                                        )}
                                    </Link>
                                </div>
                                <div className={`md:col-span-1 col-span-12 self-center ${isReversed ? 'order-1' : ''}`}>
                                    <div className="featured-product-content">
                                        <span className="text-[14px] leading-5 font-medium uppercase block mb-[5px] text-[#999999]">
                                            {block.subTitle}
                                        </span>
                                        <h2 className="relative after:bg-primary after:absolute after:left-0 after:bottom-0 after:h-[4px] after:w-[70px] pb-[10px] mb-[30px]">
                                            <Link
                                                href={href}
                                                className="transition-all hover:text-primary"
                                            >
                                                {block.title}
                                            </Link>
                                        </h2>
                                        <p
                                            dangerouslySetInnerHTML={{
                                                __html: block.excerpt,
                                            }}
                                        />
                                        <div className="mt-[60px]">
                                            <Link
                                                href={href}
                                                className={outlineButton}
                                            >
                                                {block.buttonText}
                                                <IoArrowForwardOutline className="ml-[5px]" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default FeaturedProduct;
