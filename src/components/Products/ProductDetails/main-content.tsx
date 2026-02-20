import { useState } from 'react';
import { IoAddSharp, IoHeartOutline, IoHeart, IoRemoveSharp } from 'react-icons/io5';
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
    } = product as any;
    const [quantityCount, setQuantityCount] = useState(1);
    const effectiveMax = maxQty && maxQty > 0 ? maxQty : Infinity;

    const addToCartHandler = (e: React.MouseEvent) => {
        const img = (product as any)?.xsImage || (product as any)?.mdImage;
        useFlyAnimationStore.getState().trigger('cart', img, e.clientX - 30, e.clientY - 30);
        useCartStore.getState().addItemToCart({
            id,
            title,
            price,
            quantity: quantityCount,
            totalPrice,
            image: (product as any)?.xsImage,
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
                                <span
                                    className={`${
                                        soldOutSticker ? `${soldOut}` : ''
                                    }`}
                                >
                                    {soldOutSticker}
                                </span>
                            )}
                            {bestSellerSticker && (
                                <span
                                    className={`${
                                        bestSellerSticker ? `${bestSeller}` : ''
                                    }`}
                                >
                                    {bestSellerSticker}
                                </span>
                            )}
                            {offerSticker && (
                                <span
                                    className={`${
                                        offerSticker ? `${productOffer}` : ''
                                    }`}
                                >
                                    {offerSticker}
                                </span>
                            )}
                            <img
                                className="w-full"
                                src={(product as any)?.mdImage}
                                alt={(product as any)?.altImage}
                                width={585}
                                height={585}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-6 col-span-12">
                        <div className="product-detail-content">
                            <h3 className="mb-[10px]">{(product as any)?.title}</h3>
                            {price && !discountPrice && (
                                <span className="product-price text-[30px] leading-[42px] text-[#999999] mb-[25px]">
                                    {formatPrice(price)}
                                </span>
                            )}
                            {price && discountPrice && (
                                <div className="product-price-wrap flex mb-[10px]">
                                    <span className="product-price text-[30px] leading-[42px] text-[#999999] block">
                                        {formatPrice(price)}
                                    </span>
                                    <span className="product-price text-[30px] leading-[42px] text-[#999999] block relative before:content-['-'] before:mx-[10px]">
                                        {formatPrice(discountPrice)}
                                    </span>
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
                                        soldOutSticker
                                            ? `cursor-not-allowed`
                                            : ''
                                    }`}
                                >
                                    <button
                                        type="button"
                                        className={`${addtoCartBtn} ${
                                            soldOutSticker
                                                ? `pointer-events-none`
                                                : ''
                                        } mr-[15px]`}
                                        onClick={addToCartHandler}
                                    >
                                        加入購物車
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
                                        {(product as any)?.category}
                                    </span>
                                </div>
                                <div className="category-wrap font-medium">
                                    <span>標籤：</span>
                                    <span className="text-[#666666] ml-[5px]">
                                        {(product as any)?.tag}
                                    </span>
                                </div>
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
