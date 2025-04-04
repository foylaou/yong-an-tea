"use client";
import { IoCloseOutline } from 'react-icons/io5';
import Link from 'next/link';
import useRootStore from '@/store/useRootStore'; // Update this import path
import { CartProps } from "@/components/Cart/CartTypes";
import CartItem from '@/components/Cart/CartItem'; // Assuming you have this component

const minicartGroupBtn = `flex items-center justify-center border border-[#222222] w-full h-[50px]`;

export default function Cart({ minicart, showMiniCart }: CartProps) {
    // Use Zustand store instead of useSelector
    const cartItems = useRootStore((state) => state.cart.items);

    const initialValue = 0;
    const SubTotal = cartItems.reduce(
        (accumulator, current) =>
            accumulator + current.price * current.quantity,
        initialValue
    );

    return (
        <div
            className={minicart ? 'minicart-area active' : 'minicart-area'}
            onClick={showMiniCart}
        >
            <div
                className="minicart-inner"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="minicart-top ml-[-8px]">
                    <span className="flex">
                        <IoCloseOutline
                            className="text-[#212121] text-[32px] cursor-pointer"
                            onClick={showMiniCart}
                        />
                    </span>
                </div>
                <div className="minicart-body pt-[25px]">
                    <div className="minicart-container">
                        {cartItems.length <= 0 && (
                            <h2 className="text-[20px]">
                                Your cart is currently empty.
                            </h2>
                        )}
                        <ul className="overflow-auto max-h-[205px]">
                            {cartItems.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={{
                                        id: item.id,
                                        title: item.name,
                                        quantity: item.quantity,
                                        total: item.totalPrice,
                                        price: item.price,
                                        slug: item.slug,
                                        image: item.image,
                                    }}
                                />
                            ))}
                        </ul>
                        {cartItems.length <= 0 ||
                            (initialValue === 0 && (
                                <>
                                    <div className="minicart-subtotal flex justify-between text-[24px] font-medium pt-[40px]">
                                        <span>Subtotal:</span>
                                        <span>${SubTotal.toFixed(2)}</span>
                                    </div>
                                    <ul className="minicart-group-btn pt-[40px]">
                                        <li className="mb-[15px]">
                                            <Link
                                                href="/cart"
                                                className={`${minicartGroupBtn} transition-all duration-500 hover:bg-[#222222] hover:text-white`}
                                            >
                                                View cart
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/checkout"
                                                className={`${minicartGroupBtn} bg-[#222222] text-white`}
                                            >
                                                Checkout
                                            </Link>
                                        </li>
                                    </ul>
                                </>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}