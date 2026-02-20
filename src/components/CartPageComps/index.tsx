import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cart/cart-slice';
import { formatPrice, useSettingsStore } from '../../store/settings/settings-slice';
import Link from 'next/link';
import {
    IoArrowBackSharp,
    IoCloseOutline,
    IoAddSharp,
    IoRemoveSharp,
} from 'react-icons/io5';
import EmptyCart from './EmptyCart';

function parseJSON<T>(raw: string | undefined, fallback: T): T {
    try {
        if (raw) return JSON.parse(raw);
        return fallback;
    } catch {
        return fallback;
    }
}

const qtybutton = `cursor-pointer text-center absolute`;
const qtyButtonWrap = `relative inline-flex`;

function CartPageComps() {
    const settings = useSettingsStore();
    const cartThList = parseJSON<any[]>(settings.cart_th_list_json, []);

    const cartItems = useCartStore((state) => state.items);
    const [quantityCount, setQuantityCount] = useState<Record<string, number | boolean>>({
        empty: true,
    });

    useEffect(() => {
        if (quantityCount.empty && cartItems.length) {
            const tempObj: Record<string, number> = {};
            cartItems.forEach((item) => {
                tempObj[item.id] = item.quantity;
            });

            setQuantityCount(tempObj);
        }
    }, [cartItems, quantityCount.empty]);

    useEffect(() => {
        if (!quantityCount.empty) {
            useCartStore.getState().updateItemQuantityFromCart(quantityCount as Record<string, number>);
        }
    }, [quantityCount]);

    const removeItemFromCartHandler = (id: string) => {
        useCartStore.getState().removeItemFromCart(id);
    };

    const clearAllItemHandler = () => {
        useCartStore.getState().clearAllFromCart();
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
                                            {cartThList.map(
                                                (singleCartTh: any) => (
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
                                                    {formatPrice(item.price)}
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
                                                                                (prevData[
                                                                                    item
                                                                                        .id
                                                                                ] as number) >
                                                                                0
                                                                                    ? (prevData[
                                                                                          item
                                                                                              .id
                                                                                      ] as number) -
                                                                                      1
                                                                                    : prevData[
                                                                                          item
                                                                                              .id
                                                                                      ],
                                                                        })
                                                                    );
                                                                }}
                                                            >
                                                                <IoRemoveSharp />
                                                            </button>
                                                            <input
                                                                className="qty-input outline-hidden text-center w-[100px] px-[15px] h-[46px] leading-[40px]"
                                                                type="number"
                                                                name="qtybutton"
                                                                value={
                                                                    (quantityCount[
                                                                        item.id
                                                                    ] as number) ||
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
                                                                        userInput.toString() !==
                                                                        'NaN'
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
                                                                                (prevData[
                                                                                    item
                                                                                        .id
                                                                                ] as number) +
                                                                                1,
                                                                        })
                                                                    );
                                                                }}
                                                            >
                                                                <IoAddSharp />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {formatPrice(item.totalPrice)}
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
                                                        <IoCloseOutline />
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
                                    <IoArrowBackSharp className="mr-[5px]" />
                                    {settings.cart_shop_page_btn_text}
                                </Link>
                                <div className="btn-wrap">
                                    <button
                                        onClick={clearAllItemHandler}
                                        type="button"
                                        className="inline-flex items-center border border-black h-[46px] sm:px-[42px] px-[12px] transition-all hover:bg-[#222222] hover:text-white"
                                    >
                                        {settings.cart_clear_btn_text}
                                    </button>
                                </div>
                            </div>
                            <div className="cart-info pt-[50px]">
                                <div className="grid grid-cols-12 md:gap-x-[30px] max-lm:gap-y-[30px]">
                                    <div className="md:col-span-6 col-span-12">
                                        <div className="coupon flex flex-col lg:max-w-[400px]">
                                            <h2 className="title text-[18px] mb-[30px]">
                                                {settings.cart_coupon_title}
                                            </h2>
                                            <p className="desc mb-[15px]">
                                                {settings.cart_coupon_desc}
                                            </p>
                                            <input
                                                type="text"
                                                name="coupon"
                                                placeholder="優惠券代碼"
                                                className="border border-[#cccccc] outline-hidden p-[15px_15px_13px]"
                                            />
                                            <div className="btn-wrap inline-flex items-center pt-[30px]">
                                                <button
                                                    type="submit"
                                                    className=" border border-black h-[46px] px-[42px] transition-all hover:bg-[#222222] hover:text-white"
                                                >
                                                    {settings.cart_coupon_btn_text}
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
                                                            小計：
                                                        </span>
                                                        <span>
                                                            {formatPrice(SubTotal)}
                                                        </span>
                                                    </li>
                                                    <li className="item flex justify-between">
                                                        <span className="font-bold">
                                                            合計：
                                                        </span>
                                                        <span>
                                                            {formatPrice(SubTotal)}
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="btn-wrap flex justify-center pt-[30px]">
                                                <Link
                                                    href="/checkout"
                                                    className="bg-black text-white h-[46px] leading-[46px] w-full text-center px-[42px] transition-all hover:bg-[#222222]"
                                                >
                                                    {settings.cart_proceed_btn_text}
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

export default CartPageComps;
