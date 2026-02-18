import type { GetServerSideProps } from 'next';
import type { Order, OrderItem } from '../../../types/order';
import HeaderOne from '../../../components/HeaderComps';
import Breadcrumb from '../../../components/Breadcrumb';
import FooterComps from '../../../components/FooterComps';
import AccountLayout from '../../../components/Account/AccountLayout';
import OrderDetail from '../../../components/Account/OrderDetail';
import { createPagesClient } from '../../../lib/supabase/server-pages';

interface OrderDetailPageProps {
    order: Order & { order_items: OrderItem[] };
}

function OrderDetailPage({ order }: OrderDetailPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="我的帳戶"
                item="首頁"
                itemPath="/"
                activeItem="訂單詳情"
            />
            <AccountLayout>
                <OrderDetail order={order} />
            </AccountLayout>
            <FooterComps footerContainer="container" />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const orderId = ctx.params?.id as string;
    const supabase = createPagesClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { redirect: { destination: '/auth?redirect=/account/orders', permanent: false } };
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
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

export default OrderDetailPage;
