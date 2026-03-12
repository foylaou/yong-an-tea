import type { GetServerSideProps } from 'next';
import { getAllProducts, getBestsellingProducts, getCategories } from '../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../lib/build-filters';
import { getFeaturedBlogs } from '../lib/blogs-db';
import DynamicHomeContent from '../components/DynamicHome/DynamicHomeContent';
import type { DynamicHomeContentProps } from '../components/DynamicHome/DynamicHomeContent';

function HomePage(props: DynamicHomeContentProps) {
    return <DynamicHomeContent {...props} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
    const [products, categories, bestsellingProducts, blogs] = await Promise.all([
        getAllProducts(),
        getCategories(),
        getBestsellingProducts(),
        getFeaturedBlogs(),
    ]);
    const productFilter = buildProductFilters(products, categories);

    // Variant 2
    const productTab = buildProductTabs(categories);

    return {
        props: {
            // Shared
            products,
            productFilter,
            bestsellingProducts,
            // Variant 1
            blogs,
            // Variant 2
            productTab,
        },
    };
};

export default HomePage;
