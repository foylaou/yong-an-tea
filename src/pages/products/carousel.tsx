import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductTabSlider from '../../components/ProductTab/tab-slider';
import ProductThreeColumns from '../../components/Products/ProductThreeColumns';
import FooterComps from '../../components/FooterComps';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../../lib/build-filters';

interface ProductCarouselPageProps {
    products: MarkdownItem[];
    productTab: MarkdownItem[];
    productFilter: MarkdownItem[];
}

function ProductCarouselPage({
    products,
    productTab,
    productFilter,
}: ProductCarouselPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品輪播"
            />
            <ProductTabSlider
                products={products}
                productTab={productTab}
                tabTitle="Trending items"
                containerCName="container"
                productFilter={productFilter}
                productFilterPath="carousel"
            />
            <ProductThreeColumns
                products={products}
                gridTabKey="grid_tab_3col_json"
                productFilter={productFilter}
                productFilterPath="carousel"
            />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const products = await getAllProducts();
    const categories = await getCategories();
    const productFilter = buildProductFilters(products, categories);
    const productTab = buildProductTabs(categories);

    return {
        props: {
            products,
            productTab,
            productFilter,
        },
    };
};

export default ProductCarouselPage;
