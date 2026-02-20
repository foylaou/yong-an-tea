import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import { getProductBySlug } from '../../lib/products-db';
import { getSEOByEntity, type SEOData } from '../../lib/seo-db';
import { buildProductJsonLd } from '../../lib/seo-jsonld';
import HeaderOne from '../../components/HeaderComps';
import BreadcrumbV2 from '../../components/Breadcrumb/index-2';
import ProductDetails from '../../components/Products/ProductDetails';
import FooterComps from '../../components/FooterComps';
import SEOHead from '../../components/SEOHead';
import JsonLd from '../../components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

interface ProductDetailPageProps {
    product: MarkdownItem;
    seo: SEOData | null;
}

function ProductDetailPage({
    product,
    seo,
}: ProductDetailPageProps) {
    const productJsonLd = buildProductJsonLd(product, SITE_URL);

    return (
        <>
            <SEOHead
                seo={seo}
                fallback={{
                    title: product.title,
                    description: product.desc,
                    image: product.mdImage || product.smImage,
                }}
                path={`/products/${product.slug}`}
            />
            <JsonLd data={seo?.structured_data || productJsonLd} />
            <HeaderOne headerContainer="container" />
            <BreadcrumbV2
                breadcrumbContainer="container"
                product={product}
                item="首頁"
                itemPath="/"
            />
            <ProductDetails
                product={product}
                productFilterPath="carousel"
            />
            <FooterComps
                footerContainer="container"
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

    const seo = await getSEOByEntity('product', product.uuid);

    return {
        props: {
            product,
            seo,
        },
    };
};

export default ProductDetailPage;
