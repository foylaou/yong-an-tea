import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import CategoriesBanner from '../components/CategoriesBanner';
import VideoModalTwo from '../components/VideoModal/index-2';
import ProductTab from '../components/ProductTab';
import LatestBlogTwo from '../components/HomePage/LatestBlogTwo';
import NewsletterCompsTwo from '../components/NewsletterComps/index-2';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';
import { getAllProducts, getCategories } from '../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../lib/build-filters';
import { getAllBlogs } from '../lib/blogs-db';
import { useSettingsStore } from '../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

interface HomeCategoriesPageProps {
    headerItems: MarkdownItem[];
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    productTab: MarkdownItem[];
    blogs: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function HomeCategoriesPage({
    headerItems,
    products,
    productFilter,
    productTab,
    blogs,
    footerItems,
}: HomeCategoriesPageProps) {
    const t = useSettingsStore(useShallow((s) => ({
        popularProducts: s.section_title_popular_products,
        exploreBlog: s.section_title_explore_blog,
        viewAll: s.btn_view_all,
        newsletter: s.section_title_newsletter,
        newsletterDesc: s.newsletter_desc,
    })));

    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <CategoriesBanner
                categoryBannerCName="category-banner-area pt-[25px]"
                products={products}
            />
            <VideoModalTwo
                containerCName="container"
            />
            <ProductTab
                products={products}
                productTab={productTab}
                tabTitle={t.popularProducts}
                containerCName="container"
                productFilter={productFilter}
                productFilterPath="left-sidebar"
            />
            <LatestBlogTwo
                blogs={blogs}
                sectionTitle={t.exploreBlog}
                btnPath="/blogs/sidebar"
                btnText={t.viewAll}
            />
            <NewsletterCompsTwo
                newsletterCName="newsletter-area border-b border-[#ededed] xl:pb-[120px] lg:pb-[100px] md:pb-[80px] pb-[50px]"
                sectionTitle={t.newsletter}
                sectionDesc={t.newsletterDesc}
                containerCName="container bg-[#f4f5f7] md:py-[50px] md:px-[70px] py-[20px] px-[30px]"
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
    const productTab = buildProductTabs(categories);
    const blogs = await getAllBlogs();
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            products,
            productFilter,
            productTab,
            blogs,
            footerItems,
        },
    };
};

export default HomeCategoriesPage;
