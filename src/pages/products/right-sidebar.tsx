import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductRightSideBar from '../../components/Products/ProductRightSideBar';
import FooterComps from '../../components/FooterComps';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters } from '../../lib/build-filters';

interface ProductRightSidebarPageProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
}

function ProductRightSidebarPage({
    products,
    productFilter,
}: ProductRightSidebarPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品右側欄"
            />
            <ProductRightSideBar
                products={products}
                productFilter={productFilter}
                productFilterPath="right-sidebar"
                gridTabKey="grid_tab_2col_json"
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

export default ProductRightSidebarPage;
