"use client";
import Link from 'next/link';
import Image from "next/image";
import { IoCloseOutline } from 'react-icons/io5';
import useRootStore from '@/store/useRootStore';
import EmptyWishlist from './EmptyWishlist';
import { JSX } from "react";
import {WishlistItem} from "@/store/wishlist/useWishlistStore";


interface WishlistThItem {
    id: number;
    thName: string;
    thCName: string;
}

interface WishlistPageItem {
    wishlistThList?: WishlistThItem[];
    clearWishlistBtnText?: string;
}

interface WishlistPageCompsProps {
    wishlistPageItems: WishlistPageItem[];
}



export default function WishlistPageComps({
                                              wishlistPageItems,
                                          }: WishlistPageCompsProps): JSX.Element {
    const wishlistItems = useRootStore((state) => state.wishlist.items);
    const removeFromWishlist = useRootStore((state) => state.wishlist.removeFromWishlist);
    const clearWishlist = useRootStore((state) => state.wishlist.clearWishlist);

    const removeItemFromWishlistHandler = (id: string | number): void => {
        removeFromWishlist(id);
    };

    const clearAllItemHandler = (): void => {
        clearWishlist();
    };

    return (
        <div className="wishlist border-b border-[#ededed] lg:pt-[80px] md:py-[60px] py-[30px] lg:pb-[100px] md:pb-[80px] pb-[50px]">
            <div className="container">
                {wishlistItems.length === 0 ? (
                    <EmptyWishlist />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="wishlist-table bg-[#f4f5f7] w-full text-sm text-left">
                                <thead className="text-[18px]">
                                <tr>
                                    {wishlistPageItems[0]?.wishlistThList?.map((singleWishlistTh) => (
                                        <th
                                            key={singleWishlistTh.id}
                                            scope="col"
                                            className={`${singleWishlistTh.thCName} first:pl-[100px]`}
                                        >
                                            {singleWishlistTh.thName}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {wishlistItems.map((item: WishlistItem) => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="py-[30px] pr-[25px] flex items-center font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            <Link href={item.slug} className="product-img w-[100px]">
                                                <Image src={item.image} alt={item.name || ''} width={100} height={100} />
                                            </Link>
                                            <h2 className="product-name">
                                                <Link
                                                    href={item.slug}
                                                    className="text-[14px] transition-all hover:text-primary"
                                                >
                                                    {item.name}
                                                </Link>
                                            </h2>
                                        </td>
                                        <td className="py-[30px]">${item.price.toFixed(2)}</td>
                                        <td className="py-[30px]">
                                            <Link
                                                href="https://www.amazon.com"
                                                className="inline-flex items-center bg-black text-white h-[46px] sm:px-[42px] px-[12px] transition-all hover:bg-[#222222]"
                                            >
                                                Buy Now
                                            </Link>
                                        </td>
                                        <td className="py-[30px] text-right">
                                            <button
                                                type="button"
                                                className="item-remove"
                                                onClick={() => removeItemFromWishlistHandler(item.id)}
                                            >
                                                <IoCloseOutline className="text-[24px] transition-all hover:text-red-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="group-btn flex justify-end pt-[30px]">
                            <div className="btn-wrap">
                                <button
                                    onClick={clearAllItemHandler}
                                    type="button"
                                    className="inline-flex items-center border border-black h-[46px] sm:px-[42px] px-[12px] transition-all hover:bg-[#222222] hover:text-white"
                                >
                                    {wishlistPageItems[0]?.clearWishlistBtnText || 'Clear Wishlist'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
