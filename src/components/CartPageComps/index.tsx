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
import type { CartItem } from '../../types';

function parseJSON<T>(raw: string | undefined, fallback: T): T {
    try {
        if (raw) return JSON.parse(raw);
        return fallback;
    } catch {
        return fallback;
    }
}

interface CartGroup {
    slug: string;
    name: string;
    image: string;
    items: CartItem[];
    groupTotal: number;
}

function groupByProduct(items: CartItem[]): CartGroup[] {
    const groups = new Map<string, CartGroup>();
    for (const item of items) {
        const key = item.slug.replace(/^\/products\//, '');
        if (!groups.has(key)) {
            groups.set(key, {
                slug: item.slug,
                name: item.name,
                image: item.image,
                items: [],
                groupTotal: 0,
            });
        }
        const group = groups.get(key)!;
        group.items.push(item);
        group.groupTotal += item.price * item.quantity;
    }
    return [...groups.values()];
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

    const removeItemHandler = (id: string) => {
        useCartStore.getState().removeItemFromCart(id);
    };

    const removeGroupHandler = (items: CartItem[]) => {
        items.forEach((item) => useCartStore.getState().removeItemFromCart(item.id));
    };

    const clearAllItemHandler = () => {
        useCartStore.getState().clearAllFromCart();
    };

    const SubTotal = cartItems.reduce(
        (acc, cur) => acc + cur.price * cur.quantity,
        0
    );

    const grouped = groupByProduct(cartItems);

    const linkPath = (slug: string) =>
        slug.startsWith('/products/') ? slug : `/products/${slug}`;

    // Quantity control helpers
    const decQty = (id: string) => {
        setQuantityCount((prev) => ({
            ...prev,
            [id]: (prev[id] as number) > 1 ? (prev[id] as number) - 1 : 1,
        }));
    };
    const incQty = (id: string) => {
        setQuantityCount((prev) => ({
            ...prev,
            [id]: (prev[id] as number) + 1,
        }));
    };
    const changeQty = (id: string, value: string) => {
        const num = Number(value);
        if (!isNaN(num) && num >= 0) {
            setQuantityCount((prev) => ({ ...prev, [id]: num }));
        }
    };

    const renderQtyControl = (item: CartItem) => (
        <div className={`${qtyButtonWrap}`}>
            <div className="flex justify-center w-[120px]">
                <button
                    type="button"
                    className={`${qtybutton} dec top-1/2 -translate-y-1/2 left-[4px]`}
                    onClick={() => decQty(item.id)}
                >
                    <IoRemoveSharp />
                </button>
                <input
                    className="qty-input outline-hidden text-center w-[100px] px-[15px] h-[46px] leading-[40px]"
                    type="number"
                    name="qtybutton"
                    value={(quantityCount[item.id] as number) || item.quantity}
                    onChange={(e) => changeQty(item.id, e.target.value)}
                />
                <button
                    type="button"
                    className={`${qtybutton} inc top-1/2 -translate-y-1/2 right-[4px]`}
                    onClick={() => incQty(item.id)}
                >
                    <IoAddSharp />
                </button>
            </div>
        </div>
    );

    return (
        <div className="cart border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
            <div className="container">
                {cartItems.length <= 0 && <EmptyCart />}
                {cartItems.length <= 0 ||
                    (SubTotal >= 0 && (
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
                                    <tbody>
                                        {grouped.map((group) => {
                                            const hasVariants = group.items.some((i) => i.variantName);

                                            if (!hasVariants) {
                                                // Single item, no variants — original row
                                                const item = group.items[0];
                                                return (
                                                    <tr key={item.id} className="bg-white border-b">
                                                        <td className="py-4 product-name pr-[25px] flex items-center font-medium text-gray-900 whitespace-nowrap">
                                                            <Link href={linkPath(item.slug)} className="product-img w-[100px]">
                                                                <img src={item.image} alt={item.name} />
                                                            </Link>
                                                            <h2 className="product-name">
                                                                <Link href={linkPath(item.slug)} className="text-[14px] transition-all hover:text-primary">
                                                                    {item.name}
                                                                </Link>
                                                            </h2>
                                                        </td>
                                                        <td className="py-4">{formatPrice(item.price)}</td>
                                                        <td className="py-4">{renderQtyControl(item)}</td>
                                                        <td className="py-4">{formatPrice(item.price * ((quantityCount[item.id] as number) || item.quantity))}</td>
                                                        <td className="py-4 text-right">
                                                            <button type="button" className="item-remove flex items-start text-[20px]" onClick={() => removeItemHandler(item.id)}>
                                                                <IoCloseOutline />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            // Variant group
                                            return group.items.map((item, idx) => (
                                                <tr key={item.id} className={`bg-white ${idx === group.items.length - 1 ? 'border-b' : ''}`}>
                                                    {idx === 0 ? (
                                                        <td rowSpan={group.items.length} className="py-4 product-name pr-[25px] font-medium text-gray-900 whitespace-nowrap align-top">
                                                            <div className="flex items-start">
                                                                <Link href={linkPath(group.slug)} className="product-img w-[100px] shrink-0">
                                                                    <img src={group.image} alt={group.name} />
                                                                </Link>
                                                                <div className="pl-[10px]">
                                                                    <h2 className="product-name">
                                                                        <Link href={linkPath(group.slug)} className="text-[14px] transition-all hover:text-primary">
                                                                            {group.name}
                                                                        </Link>
                                                                    </h2>
                                                                    <button
                                                                        type="button"
                                                                        className="text-[12px] text-[#999999] mt-[4px] transition-all hover:text-red-500"
                                                                        onClick={() => removeGroupHandler(group.items)}
                                                                    >
                                                                        移除全部規格
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    ) : null}
                                                    <td className="py-3">
                                                        <div className="text-[13px] text-[#666666] mb-[2px]">{item.variantName}</div>
                                                        {formatPrice(item.price)}
                                                    </td>
                                                    <td className="py-3">{renderQtyControl(item)}</td>
                                                    <td className="py-3">{formatPrice(item.price * ((quantityCount[item.id] as number) || item.quantity))}</td>
                                                    <td className="py-3 text-right">
                                                        <button type="button" className="item-remove flex items-start text-[20px]" onClick={() => removeItemHandler(item.id)}>
                                                            <IoCloseOutline />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ));
                                        })}
                                    </tbody>
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
                                                        <span className="font-bold">小計：</span>
                                                        <span>{formatPrice(SubTotal)}</span>
                                                    </li>
                                                    <li className="item flex justify-between">
                                                        <span className="font-bold">合計：</span>
                                                        <span>{formatPrice(SubTotal)}</span>
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
