import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import WishlistPageComps from '../components/WishlistPageComps';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface WishlistPageProps {
    headerItems: MarkdownItem[];
    wishlistPageItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function WishlistPage({
    headerItems,
    wishlistPageItems,
    footerItems,
}: WishlistPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="願望清單"
                item="首頁"
                itemPath="/"
                activeItem="願望清單"
            />
            <WishlistPageComps
                wishlistPageItems={wishlistPageItems}
            />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const wishlistPageItems = getAllItems('wishlist-page');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            wishlistPageItems,
            footerItems,
        },
    };
};

export default WishlistPage;
