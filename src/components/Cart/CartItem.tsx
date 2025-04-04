"use client";
import Link from 'next/link';
import { IoCloseOutline } from 'react-icons/io5';
import { CartItemProps } from "@/components/Cart/CartTypes";
import useRootStore from '@/store/useRootStore'; // Update this import path
import Image from "next/image";



export default function CartItem({ item }: CartItemProps) {
    // Get the removeFromCart action from the Zustand store
    const removeFromCart = useRootStore((state) => state.cart.removeFromCart);

    const { image, slug, title, quantity, price, id } = item;

    const removeItemFromCartHandler = () => {
        removeFromCart(id);
    };

    return (
        <li className="item flex items-start justify-between border-b border-[#dddddd] pb-[25px] mb-[20px] last:mb-0 last:pb-0 last:border-b-0">
            <div className="item-img">
                <Link href={slug} className="product-img">
                    <Image src={image} alt={title} />
                </Link>
            </div>
            <div className="item-content w-[calc(100%-88px)] pl-[20px]">
                <h3 className="leading-[21px]">
                    <Link
                        href={slug}
                        className="text-[15px] transition-all hover:text-primary"
                    >
                        {title}
                    </Link>
                </h3>
                <div className="font-medium text-[15px] leading-[26px]">
                    Qty : <span className="text-[#666666]">{quantity}</span>
                </div>
                <div className="font-medium text-[13px] leading-[23px]">
                    Price:{' '}
                    <span className="text-[#666666]">${price.toFixed(2)}</span>{' '}
                </div>
            </div>
            <button
                type="button"
                className="item-remove flex items-start"
                onClick={removeItemFromCartHandler}
            >
                <span className="flex">
                    <IoCloseOutline />
                </span>
            </button>
        </li>
    );
}