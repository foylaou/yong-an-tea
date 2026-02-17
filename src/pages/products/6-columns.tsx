import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import ProductSixColumns from '../../components/Products/ProductSixColumns';
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
            <HeaderOne
                headerItems={headerItems}
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
                gridTabItems={gridTabItems}
            />
            <FooterComps
                footerContainer="container-fluid xxl:px-[100px] px-[15px]"
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
    const gridTabItems = getAllItems('grid-tab-3');
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
