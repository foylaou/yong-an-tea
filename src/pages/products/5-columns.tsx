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
    headerItems: MarkdownItem[];
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    gridTabItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function ProductFiveColumnsPage({
    headerItems,
    products,
    productFilter,
    gridTabItems,
    footerItems,
}: ProductFiveColumnsPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
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
    const gridTabItems = getAllItems('grid-tab-2');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            products,
            productFilter,
            gridTabItems,
            footerItems,
        },
    };
};

export default ProductFiveColumnsPage;
