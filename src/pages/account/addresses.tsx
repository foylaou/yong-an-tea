import type { GetServerSideProps } from 'next';
import type { Address } from '../../types/order';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import FooterComps from '../../components/FooterComps';
import AccountLayout from '../../components/Account/AccountLayout';
import AddressManager from '../../components/Account/AddressManager';
import { createPagesClient } from '../../lib/supabase/server-pages';

interface AddressesPageProps {
    addresses: Address[];
}

function AddressesPage({ addresses }: AddressesPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="我的帳戶"
                item="首頁"
                itemPath="/"
                activeItem="收件地址"
            />
            <AccountLayout>
                <AddressManager initialAddresses={addresses} />
            </AccountLayout>
            <FooterComps footerContainer="container" />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const supabase = createPagesClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { redirect: { destination: '/auth?redirect=/account/addresses', permanent: false } };
    }

    const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    return {
        props: {
            addresses: addresses || [],
        },
    };
};

export default AddressesPage;
