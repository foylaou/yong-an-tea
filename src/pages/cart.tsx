import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import CartPageComps from '../components/CartPageComps';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface CartPageProps {
    cartPageItems: MarkdownItem[];
}

function CartPage({ cartPageItems }: CartPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
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
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const cartPageItems = getAllItems('cart-page');

    return {
        props: {
            cartPageItems,
        },
    };
};

export default CartPage;
