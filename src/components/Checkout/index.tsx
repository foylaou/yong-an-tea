import { useState } from 'react';
import { useCartStore } from '../../store/cart/cart-slice';
import { formatPrice } from '../../store/settings/settings-slice';
import Link from 'next/link';
import { IoCheckmarkCircle } from 'react-icons/io5';
import EmptyCheckout from './EmptyCheckout';
import { MarkdownItem } from '../../types';

interface CheckoutProps {
    checkoutItems: MarkdownItem[];
}

const singleField = `flex flex-col w-full`;
const inputField = `border border-[#e8e8e8] focus-visible:outline-0 placeholder:text-[#7b7975] py-[10px] px-[20px] w-full h-[50px]`;
const textareaField = `border border-[#e8e8e8] focus-visible:outline-0 placeholder:text-[#7b7975] py-[10px] px-[20px] w-full min-h-[120px]`;
const secondaryButton =
    'flex bg-secondary text-white leading-[38px] text-[15px] h-[40px] px-[32px]';

const isInitial = true;

function Checkout({ checkoutItems }: CheckoutProps) {
    const [returningCustomer, setReturningCustomer] = useState(false);
    const openReturningCustomer = () => {
        setReturningCustomer(!returningCustomer);
    };

    const [coupon, setCoupon] = useState(false);
    const openCoupon = () => {
        setCoupon(!coupon);
    };

    const cartItems = useCartStore((state) => state.items);

    const initialValue = 0;
    const SubTotal = cartItems.reduce(
        (accumulator, current) =>
            accumulator + current.price * current.quantity,
        initialValue
    );

    return (
        <div className="checkout border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
            {cartItems.length <= 0 && <EmptyCheckout />}
            {cartItems.length <= 0 ||
                (initialValue === 0 && (
                    <>
                        <div className="customer-info">
                            <div className="container">
                                <div className="grid grid-cols-12 lg:gap-x-[25px] max-md:gap-y-[30px]">
                                    <div className="xl:col-span-7 lg:col-span-6 col-span-12">
                                        <div className="customer-zone flex items-center bg-[#f4f5f7] p-[14px_30px_14px]">
                                            <div className="icon text-green-500 mr-[10px]">
                                                <IoCheckmarkCircle />
                                            </div>
                                            <h2 className="title text-[16px] leading-[28px] max-sm:whitespace-nowrap max-sm:text-ellipsis overflow-hidden">
                                                {
                                                    (checkoutItems[0] as any)
                                                        ?.customerzoneTitle
                                                }
                                                <button
                                                    type="button"
                                                    className="ml-[5px] transition-all hover:text-primary"
                                                    onClick={
                                                        openReturningCustomer
                                                    }
                                                >
                                                    {
                                                        (checkoutItems[0] as any)
                                                            ?.customerzoneBtnText
                                                    }
                                                </button>
                                            </h2>
                                        </div>
                                        {returningCustomer && (
                                            <div className="returning-form-wrap border border-[#dddddd] p-[30px] mt-[30px]">
                                                <p className="text-[#777777] text-[16px] font-normal mb-[20px]">
                                                    {
                                                        (checkoutItems[0] as any)
                                                            ?.customerzoneDesc
                                                    }
                                                </p>
                                                <form className="returning-form">
                                                    <div
                                                        className={`${singleField}  mb-[20px]`}
                                                    >
                                                        <label
                                                            htmlFor="returning-email"
                                                            className="mb-[5px]"
                                                        >
                                                            使用者名稱或電子郵件 *
                                                        </label>
                                                        <input
                                                            className={`${inputField}`}
                                                            type="email"
                                                            id="returning-email"
                                                        />
                                                    </div>
                                                    <div
                                                        className={`${singleField}  mb-[20px]`}
                                                    >
                                                        <label
                                                            htmlFor="returning-password"
                                                            className="mb-[5px]"
                                                        >
                                                            密碼 *
                                                        </label>
                                                        <input
                                                            className={`${inputField}`}
                                                            type="password"
                                                            id="returning-password"
                                                            placeholder="密碼"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className={`${secondaryButton}`}
                                                    >
                                                        登入
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                    <div className="xl:col-span-5 lg:col-span-6 col-span-12">
                                        <div className="coupon-zone flex items-center bg-[#f4f5f7] p-[14px_30px_14px]">
                                            <div className="icon text-green-500 mr-[10px]">
                                                <IoCheckmarkCircle />
                                            </div>
                                            <h2 className="title text-[16px] leading-[28px] max-sm:whitespace-nowrap max-sm:text-ellipsis overflow-hidden">
                                                {
                                                    (checkoutItems[0] as any)
                                                        ?.couponZoneTitle
                                                }

                                                <button
                                                    type="button"
                                                    className="ml-[5px] transition-all hover:text-primary"
                                                    onClick={openCoupon}
                                                >
                                                    {
                                                        (checkoutItems[0] as any)
                                                            ?.couponZoneBtnText
                                                    }
                                                </button>
                                            </h2>
                                        </div>
                                        {coupon && (
                                            <div className="returning-form-wrap border border-[#dddddd] p-[30px] mt-[30px]">
                                                <p className="text-[#777777] text-[16px] font-normal mb-[20px]">
                                                    {
                                                        (checkoutItems[0] as any)
                                                            ?.returningFormDesc
                                                    }
                                                </p>
                                                <form className="returning-form">
                                                    <div
                                                        className={`${singleField}  mb-[20px]`}
                                                    >
                                                        <input
                                                            className={`${inputField}`}
                                                            type="text"
                                                            placeholder="優惠券代碼"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className={`${secondaryButton} transition-all hover:bg-primary hover:text-white`}
                                                    >
                                                        {
                                                            (checkoutItems[0] as any)
                                                                ?.returningBtnText
                                                        }
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="checkout-wrap pt-[25px]">
                            <div className="container">
                                <div className="grid grid-cols-12 lg:gap-x-[25px] max-md:gap-y-[50px]">
                                    <div className="lg:col-span-7 col-span-12">
                                        <div className="billing">
                                            <h2 className="title text-[18px] mb-[20px]">
                                                帳單資訊
                                            </h2>
                                            <form className="billing-form">
                                                <div className="group-field flex mb-[20px]">
                                                    <div
                                                        className={`${singleField} mr-[25px]`}
                                                    >
                                                        <label
                                                            htmlFor="billing-firstname"
                                                            className="mb-[5px]"
                                                        >
                                                            名字 *
                                                        </label>
                                                        <input
                                                            className={`${inputField}`}
                                                            type="text"
                                                            id="billing-firstname"
                                                        />
                                                    </div>
                                                    <div
                                                        className={`${singleField}`}
                                                    >
                                                        <label
                                                            htmlFor="billing-lastname"
                                                            className="mb-[5px]"
                                                        >
                                                            姓氏 *
                                                        </label>
                                                        <input
                                                            className={`${inputField}`}
                                                            type="text"
                                                            id="billing-lastname"
                                                        />
                                                    </div>
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label
                                                        htmlFor="billing-companyname"
                                                        className="mb-[5px]"
                                                    >
                                                        公司名稱（選填）*
                                                    </label>
                                                    <input
                                                        className={`${inputField}`}
                                                        type="text"
                                                        id="billing-companyname"
                                                    />
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label
                                                        htmlFor="billing-companyname"
                                                        className="mb-[5px]"
                                                    >
                                                        國家 *
                                                    </label>
                                                    <select
                                                        className={`${inputField}`}
                                                    >
                                                        <option>
                                                            台灣
                                                        </option>
                                                        <option>日本</option>
                                                        <option>韓國</option>
                                                        <option>美國</option>
                                                        <option>
                                                            中國
                                                        </option>
                                                    </select>
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label>
                                                        街道地址 *
                                                        <input
                                                            className={`${inputField} mt-[5px] mb-[20px]`}
                                                            type="text"
                                                            placeholder="門牌號碼與街道名稱"
                                                        />
                                                        <input
                                                            className={`${inputField}`}
                                                            type="text"
                                                            placeholder="公寓、樓層、單位等（選填）"
                                                        />
                                                    </label>
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label
                                                        htmlFor="billing-city"
                                                        className="mb-[5px]"
                                                    >
                                                        鄉鎮 / 城市 *
                                                    </label>
                                                    <input
                                                        className={`${inputField}`}
                                                        type="text"
                                                        id="billing-city"
                                                    />
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label
                                                        htmlFor="billing-district"
                                                        className="mb-[5px]"
                                                    >
                                                        區域 *
                                                    </label>
                                                    <select
                                                        className={`${inputField}`}
                                                    >
                                                        <option>信義區</option>
                                                        <option>
                                                            大安區
                                                        </option>
                                                        <option>
                                                            中山區
                                                        </option>
                                                        <option>松山區</option>
                                                        <option>
                                                            中正區
                                                        </option>
                                                    </select>
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label
                                                        htmlFor="billing-postcode"
                                                        className="mb-[5px]"
                                                    >
                                                        郵遞區號（選填）*
                                                    </label>
                                                    <input
                                                        className={`${inputField}`}
                                                        type="text"
                                                        id="billing-postcode"
                                                    />
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label
                                                        htmlFor="billing-phone"
                                                        className="mb-[5px]"
                                                    >
                                                        電話 *
                                                    </label>
                                                    <input
                                                        className={`${inputField}`}
                                                        type="text"
                                                        id="billing-phone"
                                                    />
                                                </div>
                                                <div
                                                    className={`${singleField} mb-[20px]`}
                                                >
                                                    <label
                                                        htmlFor="billing-email"
                                                        className="mb-[5px]"
                                                    >
                                                        電子郵件 *
                                                    </label>
                                                    <input
                                                        className={`${inputField}`}
                                                        type="email"
                                                        id="billing-email"
                                                    />
                                                </div>
                                                <div className="additional-info">
                                                    <h3 className="text-[18px] mb-[15px]">
                                                        其他資訊
                                                    </h3>
                                                    <div
                                                        className={`${singleField} lg:mb-[20px]`}
                                                    >
                                                        <label
                                                            htmlFor="billing-notes"
                                                            className="mb-[5px]"
                                                        >
                                                            訂單備註（選填）
                                                        </label>
                                                        <textarea
                                                            className={`${textareaField}`}
                                                            id="billing-notes"
                                                        />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-5 col-span-12">
                                        <div className="order-info">
                                            <div className="inner bg-[#f6f6f6] border border-[#bfbfbf] p-[40px_45px_50px]">
                                                <h2 className="title text-[18px] mb-[20px]">
                                                    您的訂單
                                                </h2>
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-[18px] bg-[#f4f5f7]">
                                                        <tr>
                                                            <th
                                                                scope="col"
                                                                className="font-normal py-3"
                                                            >
                                                                商品
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="font-normal py-3 text-right"
                                                            >
                                                                合計
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="border-t border-[#cdcdcd]">
                                                        {cartItems?.map(
                                                            (item) => (
                                                                <tr
                                                                    className="border-t border-[#cdcdcd]"
                                                                    key={
                                                                        item.id
                                                                    }
                                                                >
                                                                    <th
                                                                        scope="row"
                                                                        className="py-[15px] font-normal whitespace-nowrap"
                                                                    >
                                                                        {
                                                                            item.name
                                                                        }{' '}
                                                                        X
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </th>
                                                                    <td className="py-[15px] text-right">
                                                                        {formatPrice(item.price)}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                        <tr className="border-t border-[#cdcdcd]">
                                                            <th
                                                                scope="row"
                                                                className="py-[15px] font-bold whitespace-nowrap"
                                                            >
                                                                小計
                                                            </th>
                                                            <td className="py-[15px] text-right">
                                                                {formatPrice(SubTotal)}
                                                            </td>
                                                        </tr>
                                                        <tr className="border-t border-[#cdcdcd]">
                                                            <th
                                                                scope="row"
                                                                className="py-[15px] font-bold whitespace-nowrap"
                                                            >
                                                                合計
                                                            </th>
                                                            <td className="py-[15px] text-right">
                                                                {formatPrice(SubTotal)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div className="check pt-[30px] border-t border-[#cdcdcd]">
                                                    <div className="payment-info pb-[20px]">
                                                        <h2 className="text-[18px] mb-[10px]">
                                                            {
                                                                (checkoutItems[0] as any)
                                                                    ?.checkTitle
                                                            }
                                                        </h2>
                                                        <p>
                                                            {
                                                                (checkoutItems[0] as any)
                                                                    ?.checkDesc
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="payment-info">
                                                        <h2 className="text-[18px] mb-[10px]">
                                                            {
                                                                (checkoutItems[0] as any)
                                                                    ?.paymentTitle
                                                            }
                                                        </h2>
                                                        <p>
                                                            {
                                                                (checkoutItems[0] as any)
                                                                    ?.paymentDesc
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="pt-[35px]">
                                                {(checkoutItems[0] as any)?.additionDesc}
                                                <Link
                                                    href="/privacy"
                                                    className="ml-[5px]"
                                                >
                                                    {
                                                        (checkoutItems[0] as any)
                                                            ?.privacyText
                                                    }
                                                </Link>
                                            </p>
                                            <div className="payment-btn-wrap pt-[35px]">
                                                <button
                                                    className="bg-[#222222] text-white w-full px-[42px] h-[46px] leading-[44px]"
                                                    type="submit"
                                                >
                                                    {
                                                        (checkoutItems[0] as any)
                                                            ?.orderBtnText
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ))}
        </div>
    );
}

export default Checkout;
