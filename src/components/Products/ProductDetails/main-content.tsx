import { useState, useMemo } from 'react';
import { IoAddSharp, IoHeartOutline, IoHeart, IoRemoveSharp } from 'react-icons/io5';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { useCartStore } from '../../../store/cart/cart-slice';
import { useFlyAnimationStore } from '../../../store/cart/fly-to-cart';
import { useWishlistStore } from '../../../store/wishlist/wishlist-slice';
import { formatPrice } from '../../../store/settings/settings-slice';
import { MarkdownItem } from '../../../types';

// Tailwind Related Stuff
const soldOut = `bg-black text-white block leading-[28px] absolute top-[15px] right-[15px] px-[15px] z-1`;
const bestSeller = `bg-[#f14705] text-[14px] text-white block rounded-full absolute top-[15px] left-[15px] w-[45px] h-[45px] leading-[45px] text-center z-1`;
const productOffer = `bg-[#98d8ca] text-[14px] text-white block rounded-full absolute top-[70px] left-[15px] w-[45px] h-[45px] leading-[45px] text-center z-1`;
const qtybutton = `cursor-pointer text-center absolute w-[24px] leading-[23px]`;
const qtyButtonWrap = `relative inline-flex border border-[#dddddd]`;
const addtoCartBtn = `bg-black text-white px-[42px] h-[46px] leading-[44px]`;
const wishlistBtn = `border border-[#dddddd] text-[20px] w-[46px] h-[46px] leading-[46px] inline-flex justify-center items-center transition-all hover:text-primary`;

interface MainContentProps {
    product: MarkdownItem;
}

function MainContent({ product }: MainContentProps) {
    const {
        id,
        title,
        price,
        discountPrice,
        totalPrice,
        soldOutSticker,
        bestSellerSticker,
        offerSticker,
        maxQty,
        variants,
    } = product as any;
    const [quantityCount, setQuantityCount] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);

    // Build gallery images array (from product_images or fallback to mdImage)
    const galleryImages: { mdUrl: string; smUrl: string; altText: string }[] =
        (product as any)?.images?.length > 0
            ? (product as any).images
            : (product as any)?.mdImage
                ? [{ mdUrl: (product as any).mdImage, smUrl: (product as any).smImage || (product as any).mdImage, altText: (product as any).altImage || '' }]
                : [];
    const effectiveMax = maxQty && maxQty > 0 ? maxQty : Infinity;

    // Compute price range from variants
    const hasVariants = variants && variants.length > 0;
    const variantPrices = hasVariants
        ? variants.map((v: any) => v.discountPrice ?? v.price)
        : [];
    const minPrice = hasVariants ? Math.min(...variantPrices) : null;
    const maxPrice = hasVariants ? Math.max(...variantPrices) : null;

    // Effective display price
    const displayPrice = selectedVariant
        ? selectedVariant.price
        : price;
    const displayDiscountPrice = selectedVariant
        ? selectedVariant.discountPrice
        : discountPrice;

    // Get variant-specific image or fallback to primary
    const getVariantImage = (variant: any) => {
        if (variant?.imageIndex != null && galleryImages[variant.imageIndex]) {
            return galleryImages[variant.imageIndex].smUrl;
        }
        return (product as any)?.xsImage || (product as any)?.smImage || (product as any)?.mdImage;
    };

    const addToCartHandler = (e: React.MouseEvent) => {
        const img = getVariantImage(selectedVariant);
        useFlyAnimationStore.getState().trigger('cart', img, e.clientX - 30, e.clientY - 30);
        const cartPrice = selectedVariant
            ? (selectedVariant.discountPrice ?? selectedVariant.price)
            : (discountPrice ?? price);
        const cartTitle = selectedVariant
            ? `${title} - ${selectedVariant.name}`
            : title;
        useCartStore.getState().addItemToCart({
            id: selectedVariant ? `${id}_${selectedVariant.id}` : id,
            title: cartTitle,
            price: cartPrice,
            quantity: quantityCount,
            totalPrice: cartPrice * quantityCount,
            image: img,
            slug: `/products/${product?.slug}`,
        });
    };

    const isInWishlist = useWishlistStore((state) =>
        state.items.some((item) => item.id === id)
    );

    const toggleWishlistHandler = (e: React.MouseEvent) => {
        if (isInWishlist) {
            useWishlistStore.getState().removeItemFromWishlist(id);
        } else {
            const img = (product as any)?.xsImage || (product as any)?.mdImage;
            useFlyAnimationStore.getState().trigger('wishlist', img, e.clientX - 30, e.clientY - 30);
            useWishlistStore.getState().addItemToWishlist({
                id,
                title,
                price,
                totalPrice,
                image: (product as any)?.xsImage,
                slug: `/products/${product?.slug}`,
            });
        }
    };

    return (
        <div className="product-detail border-b border-[#ededed] md:py-[90px] py-[50px]">
            <div className="container">
                <div className="grid grid-cols-12 lg:gap-x-[25px] max-md:gap-y-[25px]">
                    <div className="lg:col-span-6 col-span-12">
                        <div className="product-detail-img relative">
                            {soldOutSticker && (
                                <span className={soldOut}>
                                    {soldOutSticker}
                                </span>
                            )}
                            {bestSellerSticker && (
                                <span className={bestSeller}>
                                    {bestSellerSticker}
                                </span>
                            )}
                            {offerSticker && (
                                <span className={productOffer}>
                                    {offerSticker}
                                </span>
                            )}
                            {galleryImages.length > 1 ? (
                                <>
                                    <Swiper
                                        modules={[Navigation, Pagination, Thumbs]}
                                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                        onSwiper={setMainSwiper}
                                        navigation
                                        pagination={{ clickable: true }}
                                        spaceBetween={0}
                                        slidesPerView={1}
                                        className="product-main-swiper mb-3"
                                    >
                                        {galleryImages.map((img: any, idx: number) => (
                                            <SwiperSlide key={idx}>
                                                <img
                                                    className="w-full"
                                                    src={img.mdUrl}
                                                    alt={img.altText || `${title} ${idx + 1}`}
                                                    width={585}
                                                    height={585}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                    <Swiper
                                        modules={[Thumbs]}
                                        onSwiper={setThumbsSwiper}
                                        spaceBetween={10}
                                        slidesPerView={4}
                                        watchSlidesProgress
                                        className="product-thumbs-swiper"
                                    >
                                        {galleryImages.map((img: any, idx: number) => (
                                            <SwiperSlide key={idx} className="cursor-pointer">
                                                <img
                                                    className="w-full rounded border border-gray-200 object-cover"
                                                    src={img.smUrl}
                                                    alt={img.altText || `${title} 縮圖 ${idx + 1}`}
                                                    width={300}
                                                    height={300}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </>
                            ) : (
                                <img
                                    className="w-full"
                                    src={galleryImages[0]?.mdUrl || (product as any)?.mdImage}
                                    alt={(product as any)?.altImage}
                                    width={585}
                                    height={585}
                                />
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-6 col-span-12">
                        <div className="product-detail-content">
                            <h3 className="mb-[10px]">{(product as any)?.title}</h3>
                            {/* Price display: variant range or single price */}
                            {hasVariants && !selectedVariant ? (
                                <span className="product-price text-[30px] leading-[42px] text-[#999999] mb-[25px] block">
                                    {minPrice === maxPrice
                                        ? formatPrice(minPrice!)
                                        : `${formatPrice(minPrice!)} ~ ${formatPrice(maxPrice!)}`
                                    }
                                </span>
                            ) : displayPrice && !displayDiscountPrice ? (
                                <span className="product-price text-[30px] leading-[42px] text-[#999999] mb-[25px]">
                                    {formatPrice(displayPrice)}
                                </span>
                            ) : displayPrice && displayDiscountPrice ? (
                                <div className="product-price-wrap flex mb-[10px]">
                                    <span className="product-price text-[30px] leading-[42px] text-[#999999] block">
                                        {formatPrice(displayPrice)}
                                    </span>
                                    <span className="product-price text-[30px] leading-[42px] text-[#999999] block relative before:content-['-'] before:mx-[10px]">
                                        {formatPrice(displayDiscountPrice)}
                                    </span>
                                </div>
                            ) : null}

                            {/* Variant selector */}
                            {hasVariants && (
                                <div className="variant-selector mb-[15px]">
                                    <span className="font-medium text-[14px] block mb-[8px]">
                                        規格：
                                        {selectedVariant && <span className="text-primary ml-[5px]">{selectedVariant.name}</span>}
                                    </span>
                                    <div className="flex flex-wrap gap-[8px]">
                                        {variants.map((v: any) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => {
                                                    const next = selectedVariant?.id === v.id ? null : v;
                                                    setSelectedVariant(next);
                                                    if (next?.imageIndex != null && mainSwiper && !mainSwiper.destroyed) {
                                                        mainSwiper.slideTo(next.imageIndex);
                                                    }
                                                }}
                                                className={`border px-[16px] py-[8px] text-[14px] transition-all ${
                                                    selectedVariant?.id === v.id
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-[#dddddd] hover:border-black'
                                                }`}
                                            >
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-[14px] leading-[24px] lg:max-w-[450px]">
                                {(product as any)?.desc}
                            </p>
                            <div className="group-btn flex py-[30px]">
                                <div className={`${qtyButtonWrap} mr-[15px]`}>
                                    <div className="flex justify-center w-[120px]">
                                        <button
                                            type="button"
                                            className={`${qtybutton} dec top-1/2 -translate-y-1/2 left-[4px]`}
                                            onClick={() =>
                                                setQuantityCount(
                                                    quantityCount > 1
                                                        ? quantityCount - 1
                                                        : 1
                                                )
                                            }
                                        >
                                            <IoRemoveSharp />
                                        </button>
                                        <input
                                            className="qty-input outline-hidden text-center w-[100px] px-[15px] h-[46px] leading-[40px]"
                                            type="text"
                                            name="qtybutton"
                                            value={quantityCount}
                                            onChange={(e) => {
                                                const userInput = Number(
                                                    e.target.value
                                                );
                                                if (
                                                    userInput.toString() !==
                                                    'NaN'
                                                ) {
                                                    setQuantityCount(
                                                        Math.min(userInput, effectiveMax)
                                                    );
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={`${qtybutton} inc top-1/2 -translate-y-1/2 right-[4px]`}
                                            onClick={() =>
                                                setQuantityCount((prev) =>
                                                    prev < effectiveMax
                                                        ? prev + 1
                                                        : prev
                                                )
                                            }
                                        >
                                            <IoAddSharp />
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className={`${
                                        soldOutSticker || (hasVariants && !selectedVariant)
                                            ? `cursor-not-allowed`
                                            : ''
                                    }`}
                                >
                                    <button
                                        type="button"
                                        className={`${addtoCartBtn} ${
                                            soldOutSticker || (hasVariants && !selectedVariant)
                                                ? `pointer-events-none opacity-50`
                                                : ''
                                        } mr-[15px]`}
                                        onClick={addToCartHandler}
                                    >
                                        {hasVariants && !selectedVariant ? '請選擇規格' : '加入購物車'}
                                    </button>
                                </div>
                                <button
                                    onClick={toggleWishlistHandler}
                                    type="button"
                                    className={`${wishlistBtn} ${isInWishlist ? 'text-red-500 border-red-200' : ''}`}
                                >
                                    {isInWishlist ? <IoHeart /> : <IoHeartOutline />}
                                </button>
                            </div>
                            <div className="other-info">
                                <div className="sku-wrap font-medium">
                                    <span>商品編號：</span>
                                    <span className="text-[#666666] ml-[5px]">
                                        {(product as any)?.sku}
                                    </span>
                                </div>
                                <div className="category-wrap font-medium">
                                    <span>分類：</span>
                                    <span className="text-[#666666] ml-[5px]">
                                        {Array.isArray((product as any)?.category)
                                            ? (product as any).category.join(', ')
                                            : (product as any)?.category}
                                    </span>
                                </div>
                                <div className="category-wrap font-medium">
                                    <span>標籤：</span>
                                    <span className="text-[#666666] ml-[5px]">
                                        {(product as any)?.tag}
                                    </span>
                                </div>
                                {(() => {
                                    try {
                                        const attrs = JSON.parse((product as any)?.attributesJson || '[]')
                                            .filter((a: any) => a.name && a.value);
                                        const first3 = attrs.slice(0, 3);
                                        if (first3.length === 0) return null;
                                        return first3.map((attr: any, idx: number) => (
                                            <div key={idx} className="category-wrap font-medium">
                                                <span>{attr.name}：</span>
                                                <span className="text-[#666666] ml-[5px]">
                                                    {attr.value}{attr.unit ? ` ${attr.unit}` : ''}
                                                </span>
                                            </div>
                                        ));
                                    } catch { return null; }
                                })()}
                                <div className="social-wrap flex pt-[65px]">
                                    <span className="text-black font-medium">
                                        分享此商品：
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainContent;
