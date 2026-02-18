import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import WishlistPageComps from '../components/WishlistPageComps';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface WishlistPageProps {
    wishlistPageItems: MarkdownItem[];
}

function WishlistPage({
    wishlistPageItems,
}: WishlistPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
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
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const wishlistPageItems = getAllItems('wishlist-page');

    return {
        props: {
            wishlistPageItems,
        },
    };
};

export default WishlistPage;
