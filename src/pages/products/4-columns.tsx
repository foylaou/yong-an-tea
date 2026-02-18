import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductFourColumns from '../../components/Products/ProductFourColumns';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ProductUtil';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters } from '../../lib/build-filters';

interface ProductFourColumnsPageProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    gridTabItems: MarkdownItem[];
}

function ProductFourColumnsPage({
    products,
    productFilter,
    gridTabItems,
}: ProductFourColumnsPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品 4 欄"
            />
            <ProductFourColumns
                products={products}
                gridTabItems={gridTabItems}
                productFilter={productFilter}
                productFilterPath="4-columns"
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
    const gridTabItems = getAllItems('grid-tab-2');

    return {
        props: {
            products,
            productFilter,
            gridTabItems,
        },
    };
};

export default ProductFourColumnsPage;
