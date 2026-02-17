import type { GetServerSideProps } from 'next';
import { getAllItems } from '../lib/ItemsUtil';
import { getAllProducts, getCategories } from '../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../lib/build-filters';
import { getFeaturedBlogs } from '../lib/blogs-db';
import type { MarkdownItem } from '../types';
import DynamicHomeContent from '../components/DynamicHome/DynamicHomeContent';
import type { DynamicHomeContentProps } from '../components/DynamicHome/DynamicHomeContent';

function HomePage(props: DynamicHomeContentProps) {
    return <DynamicHomeContent {...props} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
    const headerItems = getAllItems('header');
    const footerItems = getAllItems('footer');
    const products = await getAllProducts();
    const categories = await getCategories();
    const productFilter = buildProductFilters(products, categories);

    // Variant 1
    const blogs = await getFeaturedBlogs();

    // Variant 2
    const productTab = buildProductTabs(categories);

    return {
        props: {
            headerItems,
            footerItems,
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
