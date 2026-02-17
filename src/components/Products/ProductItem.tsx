import { useState } from 'react';
import Link from 'next/link';
import {
    IoAddSharp,
    IoBagHandleOutline,
    IoPricetagOutline,
    IoHeartOutline,
    IoRemoveSharp,
} from 'react-icons/io5';
import QuickView from '../QuickView';

import { useCartStore } from '../../store/cart/cart-slice';
import { useFilterStore } from '../../store/product-filter/filter-slice';
import { useWishlistStore } from '../../store/wishlist/wishlist-slice';
import { formatPrice } from '../../store/settings/settings-slice';
import { availabilityLabel } from '../../lib/build-filters';
import { MarkdownItem } from '../../types';

// Tailwind Related Stuff
const addAction =
    'flex justify-center absolute w-full top-1/2 left-auto transform -translate-y-1/2 z-1';
const addActionButton =
    'bg-white rounded-full flex justify-center items-center text-[21px] w-[45px] h-[45px] leading-[48px] hover:text-primary transition-all opacity-0 invisible ease-in-out transform translate-y-20 duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible';
const soldOut = `bg-black text-white block leading-[28px] absolute top-[15px] right-[15px] px-[15px] z-1`;
const bestSeller = `bg-[#f14705] text-[14px] text-white block rounded-full absolute top-[15px] left-[15px] w-[45px] h-[45px] leading-[45px] text-center z-1`;
const productOffer = `bg-[#98d8ca] text-[14px] text-white block rounded-full absolute top-[70px] left-[15px] w-[45px] h-[45px] leading-[45px] text-center z-1`;
const qtybutton = `cursor-pointer text-center absolute w-[24px] leading-[23px]`;
const qtyButtonWrap = `relative inline-flex border border-[#dddddd]`;
const addtoCartBtn = `bg-black text-white px-[42px] h-[46px] leading-[44px]`;
const wishlistBtn = `border border-[#dddddd] text-[20px] w-[46px] h-[46px] leading-[46px] inline-flex justify-center items-center transition-all hover:text-primary`;
const textHover = `transition-all hover:text-primary`;

interface ProductItemProps {
    product: MarkdownItem;
    productFilter: MarkdownItem[];
    productFilterPath?: string;
}

function ProductItem({ product, productFilter, productFilterPath }: ProductItemProps) {
    const {
        id,
        title,
        price,
        discountPrice,
        totalPrice,
        soldOutSticker,
        bestSellerSticker,
        offerSticker,
        desc,
    } = product as any;

    const productImageSrc = (product as any)?.smImage;

    const [isOpen, setIsOpen] = useState(false);

    const [quantityCount, setQuantityCount] = useState(1);
    const effectiveMax = (product as any)?.maxQty && (product as any).maxQty > 0 ? (product as any).maxQty : Infinity;

    const addToCartHandler = () => {
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

    const filterChangeHandler = (isAdd: boolean, data: { title: string; key: string; group: string }) => {
        if (isAdd) {
            useFilterStore.getState().addFilter(data);
        } else {
            useFilterStore.getState().removeFilter(data);
        }
    };

    const addToWishlistHandler = () => {
        useWishlistStore.getState().addItemToWishlist({
            id,
            title,
            price,
            totalPrice,
            image: (product as any)?.xsImage,
            slug: `/products/${product?.slug}`,
        });
    };

    return (
        <>
            <div className="product-item">
                <div className="product-img relative group after:bg-[rgba(0,0,0,.1)] after:absolute after:top-0 after:left-0 after:h-full after:w-full after:opacity-0 after:transition-all after:pointer-events-none hover:after:opacity-100">
                    <Link href={`/products/${product?.slug}`} className="block">
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
                            src={productImageSrc}
                            alt={(product as any)?.altImage}
                            width={300}
                            height={300}
                        />
                    </Link>
                    <div className={addAction}>
                        <button
                            type="button"
                            className={`${addActionButton} mr-[15px] group-hover:delay-[0s]`}
                            onClick={() => setIsOpen(true)}
                        >
                            <IoAddSharp />
                        </button>
                        <div
                            className={`${
                                soldOutSticker ? `cursor-not-allowed` : ''
                            }`}
                        >
                            {!bestSellerSticker && (
                                <button
                                    type="button"
                                    onClick={addToCartHandler}
                                    className={`${
                                        soldOutSticker
                                            ? `pointer-events-none brightness-75`
                                            : ''
                                    }  ${addActionButton} mr-[15px] group-hover:delay-150`}
                                >
                                    <IoBagHandleOutline />
                                </button>
                            )}
                            {bestSellerSticker && (
                                <Link
                                    href={`/products/${product?.slug}`}
                                    className={`${
                                        soldOutSticker
                                            ? `pointer-events-none brightness-75`
                                            : ''
                                    }  ${addActionButton} mr-[15px] group-hover:delay-150`}
                                >
                                    <IoPricetagOutline />
                                </Link>
                            )}
                        </div>
                        <button
                            onClick={addToWishlistHandler}
                            type="button"
                            className={`${addActionButton} group-hover:delay-300`}
                        >
                            <IoHeartOutline />
                        </button>
                    </div>
                </div>
                <div className="product-content text-center">
                    <h3 className="mb-[5px]">
                        <Link
                            href={`/products/${product?.slug}`}
                            className="transition-all hover:text-primary text-[16px]"
                        >
                            {title}
                        </Link>
                    </h3>
                    {price && !discountPrice && (
                        <span className="product-price text-[18px] leading-[31px] text-[#666666]">
                            {formatPrice(price)}
                        </span>
                    )}
                    {price && discountPrice && (
                        <div className="product-price-wrap flex justify-center mb-[10px]">
                            <span className="product-price text-[18px] leading-[31px] text-[#666666] block">
                                {formatPrice(price)}
                            </span>
                            <span className="product-price text-[18px] leading-[31px] text-[#666666] block relative before:content-['-'] before:mx-[10px]">
                                {formatPrice(discountPrice)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <QuickView open={isOpen} onClose={() => setIsOpen(false)}>
                <div className="quickview-body w-full md:h-full h-[700px] overflow-y-auto">
                    <div className="grid md:grid-cols-2 grid-cols-1">
                        <div className="product-img md:h-full">
                            <Link
                                href={`/products/${product?.slug}`}
                                className="block relative md:h-full"
                            >
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
                                            bestSellerSticker
                                                ? `${bestSeller}`
                                                : ''
                                        }`}
                                    >
                                        {bestSellerSticker}
                                    </span>
                                )}
                                {offerSticker && (
                                    <span
                                        className={`${
                                            offerSticker
                                                ? `${productOffer}`
                                                : ''
                                        }`}
                                    >
                                        {offerSticker}
                                    </span>
                                )}
                                <img
                                    className="w-full md:h-full md:object-cover"
                                    src={(product as any)?.mdImage}
                                    alt={(product as any)?.altImage}
                                    width={585}
                                    height={585}
                                />
                            </Link>
                        </div>
                        <div className="product-content py-[40px] px-[30px]">
                            <h2 className="text-[24px] mb-[15px]">{title}</h2>
                            {price && !discountPrice && (
                                <span className="product-price text-[30px] leading-[42px] text-[#999999] block mb-[25px]">
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
                            <h3 className="stock font-semibold text-[14px] mb-[20px]">
                                庫存狀態：
                                <span className="text-[#3bc604] ml-[5px]">
                                    {availabilityLabel[(product as any)?.availability] || (product as any)?.availability}
                                </span>
                            </h3>
                            <p>{desc}</p>
                            <div className="group-btn flex max-xs:flex-wrap py-[30px]">
                                <div
                                    className={`${qtyButtonWrap} mr-[15px] max-xs:mb-[10px]`}
                                >
                                    <div className="flex justify-center lg:w-[120px] w-[100px]">
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
                                    onClick={addToWishlistHandler}
                                    type="button"
                                    className={`${wishlistBtn}`}
                                >
                                    <IoHeartOutline />
                                </button>
                            </div>
                            <div className="sku-wrap font-medium">
                                <span>商品編號：</span>
                                <span className="text-[#666666] ml-[5px]">
                                    {(product as any)?.sku}
                                </span>
                            </div>
                            <div className="category-wrap flex max-xs:flex-wrap">
                                <span className="text-black font-medium">
                                    分類：
                                </span>
                                {(productFilter[0] as any)?.categoryList?.map(
                                    (singleCategoryList: any) => (
                                        <Link
                                            href={`/products/${productFilterPath}`}
                                            key={singleCategoryList.id}
                                        >
                                            <button
                                                type="button"
                                                className={`${textHover} capitalize text-[#666666] font-medium after:content-[","] last:after:content-none ml-[10px]`}
                                                onClick={() =>
                                                    filterChangeHandler(true, {
                                                        title: singleCategoryList.categoryListTitle,
                                                        key: singleCategoryList.categorySlug,
                                                        group: 'category',
                                                    })
                                                }
                                            >
                                                {
                                                    singleCategoryList.categoryListTitle
                                                }
                                            </button>
                                        </Link>
                                    )
                                )}
                            </div>
                            <div className="tag-wrap flex max-xs:flex-wrap">
                                <span className="text-black font-medium">
                                    標籤：
                                </span>
                                {(productFilter[0] as any)?.tagList?.map(
                                    (singleTagList: any) => (
                                        <Link
                                            href={`/products/${productFilterPath}`}
                                            key={singleTagList.id}
                                        >
                                            <button
                                                type="button"
                                                className={`${textHover} capitalize text-[#666666] font-medium after:content-[","] last:after:content-none ml-[10px]`}
                                                onClick={() =>
                                                    filterChangeHandler(true, {
                                                        title: singleTagList.tagTitle,
                                                        key: singleTagList.tagSlug,
                                                        group: 'tag',
                                                    })
                                                }
                                            >
                                                {singleTagList.tagTitle}
                                            </button>
                                        </Link>
                                    )
                                )}
                            </div>
                            <div className="social-wrap flex pt-[65px]">
                                <span className="text-black font-medium">
                                    分享此商品：
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </QuickView>
        </>
    );
}

export default ProductItem;
