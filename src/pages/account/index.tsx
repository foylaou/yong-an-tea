import type { GetServerSideProps } from 'next';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import FooterComps from '../../components/FooterComps';
import AccountLayout from '../../components/Account/AccountLayout';
import ProfileForm from '../../components/Account/ProfileForm';
import { createPagesClient } from '../../lib/supabase/server-pages';

interface AccountPageProps {
    profile: { full_name: string; email: string };
}

function AccountPage({ profile }: AccountPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="我的帳戶"
                item="首頁"
                itemPath="/"
                activeItem="個人資料"
            />
            <AccountLayout>
                <ProfileForm initialData={profile} />
            </AccountLayout>
            <FooterComps footerContainer="container" />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const supabase = createPagesClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { redirect: { destination: '/auth?redirect=/account', permanent: false } };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    return {
        props: {
            profile: {
                full_name: profile?.full_name || '',
                email: user.email || '',
            },
        },
    };
};

export default AccountPage;
