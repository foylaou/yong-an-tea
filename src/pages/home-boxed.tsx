import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../types';
import HomeBoxed from '../components/HomeBoxed';
import HeaderTwo from '../components/HeaderComps/index-2';
import HeroTwo from '../components/Hero/index-2';
import VideoModalTwo from '../components/VideoModal/index-2';
import ProductTab from '../components/ProductTab';
import Brand from '../components/Brand';
import NewsletterCompsTwo from '../components/NewsletterComps/index-2';
import FooterCompsTwo from '../components/FooterComps/index-2';
import { getAllItems } from '../lib/ItemsUtil';
import { getAllProducts, getCategories } from '../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../lib/build-filters';
import { useSettingsStore } from '../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

interface HomeBoxedPageProps {
    headerItems: MarkdownItem[];
    products: MarkdownItem[];
    productTab: MarkdownItem[];
    productFilter: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function HomeBoxedPage({
    headerItems,
    products,
    productTab,
    productFilter,
    footerItems,
}: HomeBoxedPageProps) {
    const t = useSettingsStore(useShallow((s) => ({
        popularProducts: s.section_title_popular_products,
        newsletter: s.section_title_newsletter,
        newsletterDesc: s.newsletter_desc,
    })));

    return (
        <HomeBoxed>
            <HeaderTwo headerItems={headerItems} logoPath="/home-boxed" />
            <HeroTwo />
            <VideoModalTwo
                containerCName="homebox-container xl:mx-[100px] mx-[15px]"
            />
            <ProductTab
                products={products}
                productTab={productTab}
                tabTitle={t.popularProducts}
                containerCName="homebox-container xl:mx-[100px] mx-[15px]"
                productFilter={productFilter}
                productFilterPath="left-sidebar"
            />
            <Brand />
            <NewsletterCompsTwo
                newsletterCName="newsletter-area"
                sectionTitle={t.newsletter}
                sectionDesc={t.newsletterDesc}
                containerCName="homebox-container xl:mx-[100px] mx-[15px] bg-[#f4f5f7] py-[50px] lg:px-[70px] px-[15px]"
            />
            <FooterCompsTwo footerItems={footerItems} />
        </HomeBoxed>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const headerItems = getAllItems('header');
    const products = await getAllProducts();
    const categories = await getCategories();
    const productFilter = buildProductFilters(products, categories);
    const productTab = buildProductTabs(categories);
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            products,
            productFilter,
            productTab,
            footerItems,
        },
    };
};

export default HomeBoxedPage;
