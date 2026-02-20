import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import CategoriesBanner from '../../components/CategoriesBanner';
import ProductThreeColumns from '../../components/Products/ProductThreeColumns';
import FooterComps from '../../components/FooterComps';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters } from '../../lib/build-filters';

interface ProductCategoriesPageProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
}

function ProductCategoriesPage({
    products,
    productFilter,
}: ProductCategoriesPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品分類"
            />
            <CategoriesBanner
                categoryBannerCName="category-banner-area lg:pt-[100px] md:pt-[80px] pt-[50px]"
                products={products}
            />
            <ProductThreeColumns
                products={products}
                gridTabKey="grid_tab_3col_json"
                productFilter={productFilter}
                productFilterPath="/categories"
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

    return {
        props: {
            products,
            productFilter,
        },
    };
};

export default ProductCategoriesPage;
