import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductTabSlider from '../../components/ProductTab/tab-slider';
import ProductThreeColumns from '../../components/Products/ProductThreeColumns';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ProductUtil';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../../lib/build-filters';

interface ProductCarouselPageProps {
    headerItems: MarkdownItem[];
    products: MarkdownItem[];
    productTab: MarkdownItem[];
    productFilter: MarkdownItem[];
    gridTabItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function ProductCarouselPage({
    headerItems,
    products,
    productTab,
    productFilter,
    gridTabItems,
    footerItems,
}: ProductCarouselPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
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
                gridTabItems={gridTabItems}
                productFilter={productFilter}
                productFilterPath="carousel"
            />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const headerItems = getAllItems('header');
    const products = await getAllProducts();
    const categories = await getCategories();
    const productFilter = buildProductFilters(products, categories);
    const productTab = buildProductTabs(categories);
    const gridTabItems = getAllItems('grid-tab-2');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            products,
            productTab,
            productFilter,
            gridTabItems,
            footerItems,
        },
    };
};

export default ProductCarouselPage;
