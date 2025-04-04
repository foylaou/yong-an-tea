"use client";
import React, {JSX, useState} from 'react';
import Link from 'next/link';
import {
    IoMenuOutline,
    IoBagHandleOutline,
    IoHeartOutline,
    IoPersonOutline,
} from 'react-icons/io5';

import {HeaderItem} from "@/components/HeaderComps/MenuType";
import OffcanvasComps from "@/components/HeaderComps/OffcanvasComps";
import Cart from "@/components/Cart/Cart";
import useRootStore from '@/store/useRootStore'; // Update this import path


// 定義組件 Props 的介面
interface HeaderRightProps {
    headerItems: HeaderItem[];
}

// Tailwind Related Stuff
const badge =
    'bg-primary text-[12px] text-center absolute bottom-[-10px] right-[-10px] h-[20px] leading-[20px] rounded-[20px] px-[6px] transition-all group-hover:text-white';

export default function HeaderRight({ headerItems }: HeaderRightProps): JSX.Element {
    const [offcanvas, setOffcanvas] = useState(false);
    const showOffcanvas = () => setOffcanvas(!offcanvas);

    const [minicart, setMiniCart] = useState(false);
    const showMiniCart = () => setMiniCart(!minicart);

    const cartQuantity = useRootStore((state) => state.cart.totalQuantity);
    const wishlistQuantity = useRootStore((state) => state.wishlist.totalQuantity);

    return (
        <>
            <div className="flex justify-end">
                <div className="user-item md:mr-[35px] sm:mr-[25px] mr-[15px]">
                    <Link
                        href="/auth"
                        className="text-2xl hover:text-primary transition-all"
                    >
                        <IoPersonOutline />
                    </Link>
                </div>
                <div className="wishlist-item md:mr-[35px] sm:mr-[25px] mr-[15px]">
                    <Link
                        href="/wishlist"
                        className="block text-2xl relative group hover:text-primary transition-all"
                    >
                        <IoHeartOutline />
                        <span className={badge}>{wishlistQuantity}</span>
                    </Link>
                </div>
                <div className="minicart-item md:mr-[35px] sm:mr-[25px] mr-[15px]">
                    <button
                        type="button"
                        className="text-2xl relative group hover:text-primary transition-all"
                        onClick={showMiniCart}
                    >
                        <IoBagHandleOutline />
                        <span className={badge}>{cartQuantity}</span>
                    </button>
                </div>
                <div className="menu-item">
                    <button
                        type="button"
                        className="text-2xl hover:text-primary transition-all"
                        onClick={showOffcanvas}
                    >
                        <IoMenuOutline />
                    </button>
                </div>
            </div>

            <OffcanvasComps
                headerItems={headerItems}
                offcanvas={offcanvas}
                showOffcanvas={showOffcanvas}
            />
            <Cart minicart={minicart} showMiniCart={showMiniCart} />
        </>
    );
}