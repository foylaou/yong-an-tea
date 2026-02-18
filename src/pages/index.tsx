import type { GetServerSideProps } from 'next';
import { getAllProducts, getCategories } from '../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../lib/build-filters';
import { getFeaturedBlogs } from '../lib/blogs-db';
import DynamicHomeContent from '../components/DynamicHome/DynamicHomeContent';
import type { DynamicHomeContentProps } from '../components/DynamicHome/DynamicHomeContent';

function HomePage(props: DynamicHomeContentProps) {
    return <DynamicHomeContent {...props} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
    const products = await getAllProducts();
    const categories = await getCategories();
    const productFilter = buildProductFilters(products, categories);

    // Variant 1
    const blogs = await getFeaturedBlogs();

    // Variant 2
    const productTab = buildProductTabs(categories);

    return {
        props: {
            // Shared
            products,
            productFilter,
            // Variant 1
            blogs,
            // Variant 2
            productTab,
        },
    };
};

export default HomePage;
