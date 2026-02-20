import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import FooterComps from '../../components/FooterComps';
import ProductLeftSideBar from '../../components/Products/ProductLeftSideBar';
import ProductRightSideBar from '../../components/Products/ProductRightSideBar';
import ProductThreeColumns from '../../components/Products/ProductThreeColumns';
import ProductFourColumns from '../../components/Products/ProductFourColumns';
import ProductFiveColumns from '../../components/Products/ProductFiveColumns';
import ProductSixColumns from '../../components/Products/ProductSixColumns';
import CategoriesBanner from '../../components/CategoriesBanner';
import ProductTabSlider from '../../components/ProductTab/tab-slider';
import { getAllProducts, getCategories } from '../../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../../lib/build-filters';
import { createAdminClient } from '../../lib/supabase/admin';

interface ProductsPageProps {
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    productTab: MarkdownItem[];
    shopLayout: string;
}

function ProductsPage({ products, productFilter, productTab, shopLayout }: ProductsPageProps) {
    const isWide = shopLayout === '5-columns' || shopLayout === '6-columns';
    const containerClass = isWide ? 'container-fluid xxl:px-[100px] px-[15px]' : 'container';

    return (
        <>
            <HeaderOne headerContainer={containerClass} />
            <Breadcrumb
                breadcrumbContainer={containerClass}
                title="商品"
                item="首頁"
                itemPath="/"
                activeItem="商品"
            />

            {shopLayout === 'categories' && (
                <CategoriesBanner
                    categoryBannerCName="category-banner-area lg:pt-[100px] md:pt-[80px] pt-[50px]"
                    products={products}
                />
            )}

            {shopLayout === 'carousel' && (
                <ProductTabSlider
                    products={products}
                    productTab={productTab}
                    tabTitle="Trending items"
                    containerCName="container"
                    productFilter={productFilter}
                    productFilterPath="products"
                />
            )}

            {shopLayout === 'left-sidebar' && (
                <ProductLeftSideBar
                    products={products}
                    productFilter={productFilter}
                    gridTabKey="grid_tab_2col_json"
                    productFilterPath="products"
                />
            )}

            {shopLayout === 'right-sidebar' && (
                <ProductRightSideBar
                    products={products}
                    productFilter={productFilter}
                    productFilterPath="products"
                    gridTabKey="grid_tab_2col_json"
                />
            )}

            {(shopLayout === '3-columns' || shopLayout === 'categories' || shopLayout === 'carousel') && (
                <ProductThreeColumns
                    products={products}
                    gridTabKey="grid_tab_3col_json"
                    productFilter={productFilter}
                    productFilterPath="products"
                />
            )}

            {shopLayout === '4-columns' && (
                <ProductFourColumns
                    products={products}
                    gridTabKey="grid_tab_3col_json"
                    productFilter={productFilter}
                    productFilterPath="products"
                />
            )}

            {shopLayout === '5-columns' && (
                <ProductFiveColumns
                    productFiveColumnsContainer="container-fluid xl:px-[100px] px-[15px]"
                    products={products}
                    productFilter={productFilter}
                    productFilterPath="products"
                    gridTabKey="grid_tab_3col_json"
                />
            )}

            {shopLayout === '6-columns' && (
                <ProductSixColumns
                    productSixColumnsContainer="container-fluid xxl:px-[100px] px-[15px]"
                    products={products}
                    productFilter={productFilter}
                    productFilterPath="products"
                    gridTabKey="grid_tab_3col_alt_json"
                />
            )}

            <FooterComps footerContainer={containerClass} />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const products = await getAllProducts();
    const categories = await getCategories();
    const productFilter = buildProductFilters(products, categories);
    const productTab = buildProductTabs(categories);

    const supabase = createAdminClient();
    const { data: layoutRow } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'shop_layout')
        .single();
    const shopLayout = (layoutRow?.value as string) || 'left-sidebar';

    return {
        props: {
            products,
            productFilter,
            productTab,
            shopLayout,
        },
    };
};

export default ProductsPage;
