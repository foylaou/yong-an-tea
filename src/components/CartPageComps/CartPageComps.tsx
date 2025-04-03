"use client"
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
    IoArrowBackSharp,
    IoCloseOutline,
    IoAddSharp,
    IoRemoveSharp,
} from 'react-icons/io5';
import { cartActions } from '../../store/cart/cart-slice';
import EmptyCart from './EmptyCart';

// 定義類型
interface CartItem {
    id: string | number;
    slug: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    totalPrice: number;
}

interface CartThItem {
    id: string | number;
    thCName: string;
    thName: string;
}

interface CartPageItem {
    cartThList?: CartThItem[];
    shopPageBtnText?: string;
    clearCartBtnText?: string;
    couponTitle?: string;
    couponDesc?: string;
    couponBtnText?: string;
    proceedBtnText?: string;
}

interface RootState {
    cart: {
        items: CartItem[];
    };
}

interface QuantityCount {
    [key: string | number]: number;
    empty?: boolean;
}

interface CartPageCompsProps {
    cartPageItems: CartPageItem[];
}

const qtybutton = `cursor-pointer text-center absolute`;
const qtyButtonWrap = `relative inline-flex`;

export default function CartPageComps({ cartPageItems }: CartPageCompsProps) {
    const dispatch = useDispatch();

    const cartItems = useSelector((state: RootState) => state.cart.items);
    const [quantityCount, setQuantityCount] = useState<QuantityCount>({
        empty: true,
    });

    useEffect(() => {
        if (quantityCount.empty && cartItems.length) {
            const tempObj: QuantityCount = {};
            cartItems.forEach((item) => {
                tempObj[item.id] = item.quantity;
            });

            setQuantityCount(tempObj);
        }
    }, [cartItems, quantityCount.empty]);

    useEffect(() => {
        if (!quantityCount.empty) {
            dispatch(cartActions.updateItemQuantityFromCart(quantityCount));
        }
    }, [dispatch, quantityCount]);

    const removeItemFromCartHandler = (id: string | number) => {
        dispatch(cartActions.removeItemFromCart(id));
    };

    const clearAllItemHandler = () => {
        dispatch(cartActions.clearAllFromCart());
    };

    const initialValue = 0;
    const SubTotal = cartItems.reduce(
        (accumulator, current) =>
            accumulator + current.price * current.quantity,
        initialValue
    );

    return (
        <div className="cart border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
            <div className="container">
                {cartItems.length <= 0 && <EmptyCart />}
                {cartItems.length <= 0 ||
                    (initialValue === 0 && (
                        <>
                            <div className="relative overflow-x-auto">
                                <table className="cart-table w-full text-sm text-left">
                                    <thead className="text-[18px] bg-[#f4f5f7]">
                                    <tr>
                                        {cartPageItems[0]?.cartThList?.map(
                                            (singleCartTh) => (
                                                <th
                                                    key={singleCartTh.id}
                                                    scope="col"
                                                    className={`${singleCartTh.thCName} first:pl-[100px]`}
                                                >
                                                    {singleCartTh.thName}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                    </thead>
                                    {cartItems.map((item) => (
                                        <tbody key={item.id}>
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="py-4 product-name pr-[25px] flex items-center font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                <Link
                                                    href={item.slug}
                                                    className="product-img w-[100px]"
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                    />
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
                                            <td className="py-4">
                                                ${item.price.toFixed(2)}
                                            </td>
                                            <td className="py-4">
                                                <div
                                                    className={`${qtyButtonWrap} mr-[15px]`}
                                                >
                                                    <div className="flex justify-center w-[120px]">
                                                        <button
                                                            type="button"
                                                            className={`${qtybutton} dec top-1/2 -translate-y-1/2 left-[4px]`}
                                                            onClick={() => {
                                                                setQuantityCount(
                                                                    (
                                                                        prevData
                                                                    ) => ({
                                                                        ...prevData,
                                                                        [item.id]:
                                                                            prevData[
                                                                                item
                                                                                    .id
                                                                                ] >
                                                                            0
                                                                                ? prevData[
                                                                                    item
                                                                                        .id
                                                                                    ] -
                                                                                1
                                                                                : prevData[
                                                                                    item
                                                                                        .id
                                                                                    ],
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                                <span className="flex">
                                                                    <IoRemoveSharp />
                                                                </span>
                                                        </button>
                                                        <input
                                                            className="qty-input outline-none text-center w-[100px] px-[15px] h-[46px] leading-[40px]"
                                                            type="number"
                                                            name="qtybutton"
                                                            value={
                                                                quantityCount[
                                                                    item.id
                                                                    ] ||
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                e
                                                            ) => {
                                                                const userInput =
                                                                    Number(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    );
                                                                if (
                                                                    !isNaN(userInput)
                                                                ) {
                                                                    setQuantityCount(
                                                                        (
                                                                            prevData
                                                                        ) => ({
                                                                            ...prevData,
                                                                            [item.id]:
                                                                            userInput,
                                                                        })
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={`${qtybutton} inc top-1/2 -translate-y-1/2 right-[4px]`}
                                                            onClick={() => {
                                                                setQuantityCount(
                                                                    (
                                                                        prevData
                                                                    ) => ({
                                                                        ...prevData,
                                                                        [item.id]:
                                                                        prevData[
                                                                            item
                                                                                .id
                                                                            ] +
                                                                        1,
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                                <span className="flex">
                                                                    <IoAddSharp />
                                                                </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                $
                                                {item.totalPrice.toFixed(2)}
                                            </td>
                                            <td className="py-4 text-right">
                                                <button
                                                    type="button"
                                                    className="item-remove flex items-start text-[20px]"
                                                    onClick={() =>
                                                        removeItemFromCartHandler(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                        <span className="flex">
                                                            <IoCloseOutline />
                                                        </span>
                                                </button>
                                            </td>
                                        </tr>
                                        </tbody>
                                    ))}
                                </table>
                            </div>
                            <div className="group-btn flex justify-between pt-[50px]">
                                <Link
                                    href="/products/left-sidebar"
                                    className="inline-flex items-center bg-black text-white h-[46px] sm:px-[42px] px-[12px] transition-all hover:bg-[#222222]"
                                >
                                    <span className="flex mr-[5px]">
                                        <IoArrowBackSharp />
                                    </span>
                                    {cartPageItems[0]?.shopPageBtnText}
                                </Link>
                                <div className="btn-wrap">
                                    <button
                                        onClick={clearAllItemHandler}
                                        type="button"
                                        className="inline-flex items-center border border-black h-[46px] sm:px-[42px] px-[12px] transition-all hover:bg-[#222222] hover:text-white"
                                    >
                                        {cartPageItems[0]?.clearCartBtnText}
                                    </button>
                                </div>
                            </div>
                            <div className="cart-info pt-[50px]">
                                <div className="grid grid-cols-12 md:gap-x-[30px] max-lm:gap-y-[30px]">
                                    <div className="md:col-span-6 col-span-12">
                                        <div className="coupon flex flex-col lg:max-w-[400px]">
                                            <h2 className="title text-[18px] mb-[30px]">
                                                {cartPageItems[0]?.couponTitle}
                                            </h2>
                                            <p className="desc mb-[15px]">
                                                {cartPageItems[0]?.couponDesc}
                                            </p>
                                            <input
                                                type="text"
                                                name="coupon"
                                                placeholder="Coupon code"
                                                className="border border-[#cccccc] outline-none p-[15px_15px_13px]"
                                            />
                                            <div className="btn-wrap inline-flex items-center pt-[30px]">
                                                <button
                                                    type="submit"
                                                    className=" border border-black h-[46px] px-[42px] transition-all hover:bg-[#222222] hover:text-white"
                                                >
                                                    {
                                                        cartPageItems[0]
                                                            ?.couponBtnText
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-6 col-span-12">
                                        <div className="cart-subtotal lg:max-w-[400px] ml-auto">
                                            <div className="border border-[#bfbfbf] bg-[#f9f9f9] px-[30px]">
                                                <ul className="content py-[30px]">
                                                    <li className="item flex justify-between border-b border-[#cdcdcd] pb-[16px] mb-[17px]">
                                                        <span className="font-bold">
                                                            Subtotal:
                                                        </span>
                                                        <span>
                                                            $
                                                            {SubTotal.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </li>
                                                    <li className="item flex justify-between">
                                                        <span className="font-bold">
                                                            Total:
                                                        </span>
                                                        <span>
                                                            $
                                                            {SubTotal.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="btn-wrap flex justify-center pt-[30px]">
                                                <Link
                                                    href="/checkout"
                                                    className="bg-black text-white h-[46px] leading-[46px] w-full text-center px-[42px] transition-all hover:bg-[#222222]"
                                                >
                                                    {
                                                        cartPageItems[0]
                                                            ?.proceedBtnText
                                                    }
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))}
            </div>
        </div>
    );
}