import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import Checkout from '../components/Checkout';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface CheckoutPageProps {
    headerItems: MarkdownItem[];
    checkoutItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function CheckoutPage({ headerItems, checkoutItems, footerItems }: CheckoutPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="結帳"
                item="首頁"
                itemPath="/"
                activeItem="結帳"
            />
            <Checkout checkoutItems={checkoutItems} />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const checkoutItems = getAllItems('checkout');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            checkoutItems,
            footerItems,
        },
    };
};

export default CheckoutPage;
