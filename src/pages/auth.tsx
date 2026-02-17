import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import AuthForm from '../components/Auth/AuthForm';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface AuthPageProps {
    headerItems: MarkdownItem[];
    authItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function AuthPage({ headerItems, authItems, footerItems }: AuthPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
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
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const authItems = getAllItems('auth-data');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            authItems,
            footerItems,
        },
    };
};

export default AuthPage;
