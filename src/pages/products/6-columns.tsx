import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductSixColumns from '../../components/Products/ProductSixColumns';
import FooterComps from '../../components/FooterComps';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters } from '../../lib/build-filters';

interface ProductSixColumnsPageProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
}

function ProductSixColumnsPage({
    products,
    productFilter,
}: ProductSixColumnsPageProps) {
    return (
        <>
            <HeaderOne
                headerContainer="container-fluid xxl:px-[100px] px-[15px]"
            />
            <Breadcrumb
                breadcrumbContainer="container-fluid xxl:px-[100px] px-[15px]"
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品 6 欄"
            />
            <ProductSixColumns
                productSixColumnsContainer="container-fluid xxl:px-[100px] px-[15px]"
                products={products}
                productFilter={productFilter}
                productFilterPath="6-columns"
                gridTabKey="grid_tab_3col_alt_json"
            />
            <FooterComps
                footerContainer="container-fluid xxl:px-[100px] px-[15px]"
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

export default ProductSixColumnsPage;
