import type { GetServerSideProps } from 'next';
import type { Order } from '../../types/order';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import FooterComps from '../../components/FooterComps';
import AccountLayout from '../../components/Account/AccountLayout';
import OrderList from '../../components/Account/OrderList';
import { createPagesClient } from '../../lib/supabase/server-pages';

interface OrdersPageProps {
    orders: Order[];
    total: number;
}

const PER_PAGE = 10;

function OrdersPage({ orders, total }: OrdersPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="我的帳戶"
                item="首頁"
                itemPath="/"
                activeItem="訂單記錄"
            />
            <AccountLayout>
                <OrderList
                    initialOrders={orders}
                    initialTotal={total}
                    perPage={PER_PAGE}
                />
            </AccountLayout>
            <FooterComps footerContainer="container" />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const supabase = createPagesClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { redirect: { destination: '/auth?redirect=/account/orders', permanent: false } };
    }

    const { data: orders, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .range(0, PER_PAGE - 1);

    return {
        props: {
            orders: orders || [],
            total: count || 0,
        },
    };
};

export default OrdersPage;
