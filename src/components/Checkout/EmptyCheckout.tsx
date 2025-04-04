"use client";
import Link from 'next/link';
import { IoArrowBackSharp, IoCartOutline } from 'react-icons/io5';

export default function EmptyCheckout() {
    return (
        <div className="empty-checkout flex flex-col items-center">
            <span className="icon text-[170px]">
                <span className="flex">
                    <IoCartOutline />
                </span>
            </span>
            <p className="text-[20px]">No items found in cart to checkout</p>
            <div className="btn-wrap pt-[25px]">
                <Link
                    href="/products/left-sidebar"
                    className="inline-flex items-center bg-black text-white h-[46px] px-[42px] transition-all hover:bg-[#222222]"
                >
                    <span className="flex mr-[5px]">
                        <IoArrowBackSharp />
                    </span>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}