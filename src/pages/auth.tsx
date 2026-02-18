import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import AuthForm from '../components/Auth/AuthForm';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface AuthPageProps {
    authItems: MarkdownItem[];
}

function AuthPage({ authItems }: AuthPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="登入"
                item="首頁"
                itemPath="/"
                activeItem="登入"
            />
            <AuthForm authItems={authItems} />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const authItems = getAllItems('auth-data');

    return {
        props: {
            authItems,
        },
    };
};

export default AuthPage;
