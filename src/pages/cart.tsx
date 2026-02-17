import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import CartPageComps from '../components/CartPageComps';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface CartPageProps {
    headerItems: MarkdownItem[];
    cartPageItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function CartPage({ headerItems, cartPageItems, footerItems }: CartPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="購物車"
                item="首頁"
                itemPath="/"
                activeItem="購物車"
            />
            <CartPageComps cartPageItems={cartPageItems} />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const cartPageItems = getAllItems('cart-page');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            cartPageItems,
            footerItems,
        },
    };
};

export default CartPage;
