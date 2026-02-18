import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useEffect } from 'react';
import type { Order, OrderItem } from '../../types/order';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import FooterComps from '../../components/FooterComps';
import { createPagesClient } from '../../lib/supabase/server-pages';
import { formatPrice } from '../../store/settings/settings-slice';
import { useCartStore } from '../../store/cart/cart-slice';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

interface OrderSuccessProps {
    order: Order & { order_items: OrderItem[] };
}

const paymentMethodLabel: Record<string, string> = {
    line_pay: 'LINE Pay',
    bank_transfer: '銀行轉帳',
    cod: '貨到付款',
};

const paymentStatusLabel: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    failed: '付款失敗',
    refunded: '已退款',
};

function OrderSuccessPage({ order }: OrderSuccessProps) {
    const clearAllFromCart = useCartStore((state) => state.clearAllFromCart);

    // Clear cart on mount (in case redirect didn't clear it)
    useEffect(() => {
        clearAllFromCart();
    }, [clearAllFromCart]);

    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="訂單完成"
                item="首頁"
                itemPath="/"
                activeItem="訂單完成"
            />
            <div className="border-b border-[#ededed] lg:py-[90px] md:py-[80px] py-[50px]">
                <div className="container max-w-[800px]">
                    {/* Success header */}
                    <div className="text-center mb-[40px]">
                        <IoCheckmarkCircleOutline className="text-green-500 text-[80px] mx-auto mb-4" />
                        <h1 className="text-[24px] font-medium mb-2">訂單已成功建立！</h1>
                        <p className="text-gray-500">
                            訂單編號：<span className="font-mono font-medium text-black">{order.order_number}</span>
                        </p>
                    </div>

                    {/* Order details */}
                    <div className="bg-[#f6f6f6] border border-[#bfbfbf] p-[30px_35px] mb-[30px]">
                        <h2 className="text-[18px] font-medium mb-[20px]">訂單資訊</h2>

                        <div className="grid grid-cols-2 gap-4 mb-[20px] text-sm">
                            <div>
                                <span className="text-gray-500">付款方式：</span>
                                <span>{paymentMethodLabel[order.payment_method] || order.payment_method}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">付款狀態：</span>
                                <span>{paymentStatusLabel[order.payment_status] || order.payment_status}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">收件人：</span>
                                <span>{order.customer_name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">電話：</span>
                                <span>{order.customer_phone}</span>
                            </div>
                        </div>

                        {order.shipping_address && (
                            <div className="text-sm mb-[20px]">
                                <span className="text-gray-500">寄送地址：</span>
                                <span>
                                    {order.shipping_address.postal_code && `${order.shipping_address.postal_code} `}
                                    {order.shipping_address.city}
                                    {order.shipping_address.district}
                                    {order.shipping_address.address_line1}
                                    {order.shipping_address.address_line2 && ` ${order.shipping_address.address_line2}`}
                                </span>
                            </div>
                        )}

                        {/* Items */}
                        <table className="w-full text-sm border-t border-[#cdcdcd]">
                            <thead>
                                <tr className="border-b border-[#cdcdcd]">
                                    <th className="py-3 text-left font-medium">商品</th>
                                    <th className="py-3 text-center font-medium">數量</th>
                                    <th className="py-3 text-right font-medium">小計</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.order_items?.map((item) => (
                                    <tr key={item.id} className="border-b border-[#e8e8e8]">
                                        <td className="py-3">{item.product_title}</td>
                                        <td className="py-3 text-center">{item.quantity}</td>
                                        <td className="py-3 text-right">{formatPrice(Number(item.subtotal))}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-b border-[#cdcdcd]">
                                    <td colSpan={2} className="py-3 font-medium">小計</td>
                                    <td className="py-3 text-right">{formatPrice(Number(order.subtotal))}</td>
                                </tr>
                                <tr className="border-b border-[#cdcdcd]">
                                    <td colSpan={2} className="py-3 font-medium">運費</td>
                                    <td className="py-3 text-right">
                                        {Number(order.shipping_fee) === 0 ? (
                                            <span className="text-green-600">免運費</span>
                                        ) : (
                                            formatPrice(Number(order.shipping_fee))
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="py-3 font-bold text-lg">合計</td>
                                    <td className="py-3 text-right font-bold text-lg">
                                        {formatPrice(Number(order.total))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/products/left-sidebar"
                            className="px-8 h-[46px] leading-[44px] bg-[#222] text-white transition-all hover:bg-black"
                        >
                            繼續購物
                        </Link>
                        <Link
                            href="/account/orders"
                            className="px-8 h-[46px] leading-[44px] border border-[#222] text-[#222] transition-all hover:bg-[#222] hover:text-white"
                        >
                            查看訂單記錄
                        </Link>
                    </div>
                </div>
            </div>
            <FooterComps footerContainer="container" />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const orderNumber = ctx.params?.orderNumber as string;
    const supabase = createPagesClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { redirect: { destination: '/auth', permanent: false } };
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .eq('customer_id', user.id)
        .single();

    if (error || !order) {
        return { notFound: true };
    }

    return {
        props: {
            order,
        },
    };
};

export default OrderSuccessPage;
