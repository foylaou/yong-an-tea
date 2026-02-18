import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    IoMenuOutline,
    IoBagHandleOutline,
    IoHeartOutline,
    IoPersonOutline,
    IoLogOutOutline,
} from 'react-icons/io5';

import { useCartStore } from '../../store/cart/cart-slice';
import { useWishlistStore } from '../../store/wishlist/wishlist-slice';
import { createClient } from '../../lib/supabase/client';
import Cart from '../Cart';
import OffcanvasComps from './OffcanvasComps';

// Tailwind Related Stuff
const badge =
    'bg-primary text-[12px] text-center absolute bottom-[-10px] right-[-10px] h-[20px] leading-[20px] rounded-[20px] px-[6px] transition-all group-hover:text-white';

function HeaderRight() {
    const router = useRouter();
    const [offcanvas, setOffcanvas] = useState(false);
    const showOffcanvas = () => setOffcanvas(!offcanvas);

    const [minicart, setMiniCart] = useState(false);
    const showMiniCart = () => setMiniCart(!minicart);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsLoggedIn(!!user);
        });
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setShowUserMenu(false);
        router.push('/');
    };

    const cartQuantity = useCartStore((state) => state.totalQuantity);
    const wishlistQuantity = useWishlistStore(
        (state) => state.totalQuantity
    );

    return (
        <>
            <div className="flex justify-end">
                <div className="user-item md:mr-[35px] sm:mr-[25px] mr-[15px] relative" ref={userMenuRef}>
                    {isLoggedIn ? (
                        <>
                            <button
                                type="button"
                                className="text-2xl hover:text-primary transition-all"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <IoPersonOutline />
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-50">
                                    <Link
                                        href="/account"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        我的帳戶
                                    </Link>
                                    <Link
                                        href="/account/orders"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        訂單記錄
                                    </Link>
                                    <hr className="my-1 border-gray-100" />
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <IoLogOutOutline />
                                        登出
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Link
                            href="/auth"
                            className="text-2xl hover:text-primary transition-all"
                        >
                            <IoPersonOutline />
                        </Link>
                    )}
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
                offcanvas={offcanvas}
                showOffcanvas={showOffcanvas}
            />
            <Cart minicart={minicart} showMiniCart={showMiniCart} />
        </>
    );
}

export default HeaderRight;
