import type { GetServerSideProps } from 'next';
import type { Address } from '@/types';
import type { ShippingSettings, PaymentToggles } from '../lib/orders-db';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import CheckoutForm from '../components/Checkout/CheckoutForm';
import FooterComps from '../components/FooterComps';
import { createPagesClient } from '../lib/supabase/server-pages';
import { getShippingSettings, getPaymentToggles } from '../lib/orders-db';

interface CheckoutPageProps {
    addresses: Address[];
    shippingSettings: ShippingSettings;
    paymentToggles: PaymentToggles;
    userEmail: string;
    userName: string;
}

function CheckoutPage({
    addresses,
    shippingSettings,
    paymentToggles,
    userEmail,
    userName,
}: CheckoutPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="結帳"
                item="首頁"
                itemPath="/"
                activeItem="結帳"
            />
            <CheckoutForm
                addresses={addresses}
                shippingSettings={shippingSettings}
                paymentToggles={paymentToggles}
                userEmail={userEmail}
                userName={userName}
            />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const supabase = createPagesClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();

    // User must be logged in (middleware should handle redirect, but just in case)
    if (!user) {
        return {
            redirect: { destination: '/auth?redirect=/checkout', permanent: false },
        };
    }

    // Fetch user's addresses
    const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    // Fetch shipping settings and payment toggles
    const [shippingSettings, paymentToggles] = await Promise.all([
      getShippingSettings(),
      getPaymentToggles(),
    ]);

    return {
        props: {
            addresses: addresses || [],
            shippingSettings,
            paymentToggles,
            userEmail: user.email || '',
            userName: profile?.full_name || '',
        },
    };
};

export default CheckoutPage;
