import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductLeftSideBar from '../../components/Products/ProductLeftSideBar';
import FooterComps from '../../components/FooterComps';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters } from '../../lib/build-filters';

interface ProductLeftSidebarPageProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
}

function ProductLeftSidebarPage({
    products,
    productFilter,
}: ProductLeftSidebarPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品左側欄"
            />
            <ProductLeftSideBar
                products={products}
                productFilter={productFilter}
                gridTabKey="grid_tab_2col_json"
                productFilterPath="left-sidebar"
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

export default ProductLeftSidebarPage;
