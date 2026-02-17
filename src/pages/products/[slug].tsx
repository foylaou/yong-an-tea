import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import { getAllItems } from '../../lib/ProductUtil';
import { getProductBySlug } from '../../lib/products-db';
import HeaderOne from '../../components/HeaderComps';
import BreadcrumbV2 from '../../components/Breadcrumb/index-2';
import ProductDetails from '../../components/Products/ProductDetails';
import FooterComps from '../../components/FooterComps';

interface ProductDetailPageProps {
    product: MarkdownItem;
    headerItems: MarkdownItem[];
    productDetailTabItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function ProductDetailPage({
    product,
    headerItems,
    productDetailTabItems,
    footerItems,
}: ProductDetailPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <BreadcrumbV2
                breadcrumbContainer="container"
                product={product}
                item="首頁"
                itemPath="/"
            />
            <ProductDetails
                product={product}
                productDetailTabItems={productDetailTabItems}
                productFilterPath="carousel"
            />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as { slug: string };

    const product = await getProductBySlug(slug);
    if (!product) {
        return { notFound: true };
    }

    const headerItems = getAllItems('header');
    const productDetailTabItems = getAllItems('product-detail-tab');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            product,
            productDetailTabItems,
            footerItems,
        },
    };
};

export default ProductDetailPage;
