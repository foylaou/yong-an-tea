"use client";
import {JSX, useState} from 'react';
import { IoAddSharp, IoHeartOutline, IoRemoveSharp } from 'react-icons/io5';
import useRootStore from '@/store/useRootStore';
import Image from "next/image";
import {Product} from "@/components/Products/ProductsTypes";

// Tailwind Related Stuff
const soldOut = `bg-black text-white block leading-[28px] absolute top-[15px] right-[15px] px-[15px] z-[1]`;
const bestSeller = `bg-[#f14705] text-[14px] text-white block rounded-full absolute top-[15px] left-[15px] w-[45px] h-[45px] leading-[45px] text-center z-[1]`;
const productOffer = `bg-[#98d8ca] text-[14px] text-white block rounded-full absolute top-[70px] left-[15px] w-[45px] h-[45px] leading-[45px] text-center z-[1]`;
const qtybutton = `cursor-pointer text-center absolute w-[24px] leading-[23px]`;
const qtyButtonWrap = `relative inline-flex border border-[#dddddd]`;
const addtoCartBtn = `bg-black text-white px-[42px] h-[46px] leading-[44px]`;
const wishlistBtn = `border border-[#dddddd] text-[20px] w-[46px] h-[46px] leading-[46px] inline-flex justify-center items-center transition-all hover:text-primary`;

interface ExtendedProduct extends Product {
    discountPrice?: number;
    totalPrice?: number;
    soldOutSticker?: string;
    bestSellerSticker?: string;
    offerSticker?: string;
    desc?: string;
    xsImage?: string;
    mdImage?: string;
    altImage?: string;
    sku?: string;
    tag?: string;
}

interface MainContentProps {
    product: ExtendedProduct;
}

export default function MainContent({
                                        product
                                    }: MainContentProps): JSX.Element {
    const {
        id,
        title,
        price,
        discountPrice,
        soldOutSticker,
        bestSellerSticker,
        offerSticker,
    } = product;
    const [quantityCount, setQuantityCount] = useState<number>(1);

    const { addToCart  }= useRootStore((state) => state.cart);
    const { addToWishlist } = useRootStore((state) => state.wishlist);
    const addToCartHandler = (): void => {
        addToCart({
            id,
            name: title,
            title, // ✅ 補上這行
            price: price,
            quantity: quantityCount,
            totalPrice: price * quantityCount,
            image: `/images/products/${product?.slug}/${product?.xsImage}`,
            slug: `/products/${product?.slug}`,
        });
    };


    const addToWishlistHandler = (): void => {
        addToWishlist({
            id,
            title,
            name: title, // 假設 name 和 title 相同
            price,
            totalPrice: price, // 可以省略，store 會自動處理
            quantity: 1, // 預設數量
            image: `/images/products/${product?.slug}/${product?.xsImage}`,
            slug: `/products/${product?.slug}`,
        });
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
                            <Image
                                className="w-full"
                                src={`/images/products/${product?.slug}/${product?.mdImage}`}
                                alt={product?.altImage || ''}
                                width={585}
                                height={585}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-6 col-span-12">
                        <div className="product-detail-content">
                            <h3 className="mb-[10px]">{product?.title}</h3>
                            {price && !discountPrice && (
                                <span className="product-price text-[30px] leading-[42px] text-[#999999] mb-[25px]">
                                    ${price.toFixed(2)}
                                </span>
                            )}
                            {price && discountPrice && (
                                <div className="product-price-wrap flex mb-[10px]">
                                    <span className="product-price text-[30px] leading-[42px] text-[#999999] block">
                                        ${price.toFixed(2)}
                                    </span>
                                    <span className="product-price text-[30px] leading-[42px] text-[#999999] block relative before:content-['-'] before:mx-[10px]">
                                        ${discountPrice.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            <p className="text-[14px] leading-[24px] lg:max-w-[450px]">
                                {product?.desc}
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
                                            className="qty-input outline-none text-center w-[100px] px-[15px] h-[46px] leading-[40px]"
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
                                                    setQuantityCount(userInput);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={`${qtybutton} inc top-1/2 -translate-y-1/2 right-[4px]`}
                                            onClick={() =>
                                                setQuantityCount(
                                                    quantityCount >= 0
                                                        ? quantityCount + 1
                                                        : quantityCount
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
                                        Add to cart
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
                            <div className="other-info">
                                <div className="sku-wrap font-medium">
                                    <span>SKU:</span>
                                    <span className="text-[#666666] ml-[5px]">
                                        {product?.sku}
                                    </span>
                                </div>
                                <div className="category-wrap font-medium">
                                    <span>Categories:</span>
                                    <span className="text-[#666666] ml-[5px]">
                                        {product?.category}
                                    </span>
                                </div>
                                <div className="category-wrap font-medium">
                                    <span>Tags:</span>
                                    <span className="text-[#666666] ml-[5px]">
                                        {product?.tag}
                                    </span>
                                </div>
                                <div className="social-wrap flex pt-[65px]">
                                    <span className="text-black font-medium">
                                        Share this items :
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