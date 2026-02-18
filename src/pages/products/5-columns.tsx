import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductFiveColumns from '../../components/Products/ProductFiveColumns';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ProductUtil';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters } from '../../lib/build-filters';

interface ProductFiveColumnsPageProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    gridTabItems: MarkdownItem[];
}

function ProductFiveColumnsPage({
    products,
    productFilter,
    gridTabItems,
}: ProductFiveColumnsPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品 5 欄"
            />
            <ProductFiveColumns
                productFiveColumnsContainer="container-fluid xl:px-[100px] px-[15px]"
                products={products}
                productFilter={productFilter}
                productFilterPath="5-columns"
                gridTabItems={gridTabItems}
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

export default ProductFiveColumnsPage;
