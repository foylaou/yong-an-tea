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
import { getAllProducts, getCategories } from '../lib/products-db';
import { buildProductFilters, buildProductTabs } from '../lib/build-filters';
import { useSettingsStore } from '../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

interface HomeBoxedPageProps {
    products: MarkdownItem[];
    productTab: MarkdownItem[];
    productFilter: MarkdownItem[];
}

function HomeBoxedPage({
    products,
    productTab,
    productFilter,
}: HomeBoxedPageProps) {
    const t = useSettingsStore(useShallow((s) => ({
        popularProducts: s.section_title_popular_products,
        newsletter: s.section_title_newsletter,
        newsletterDesc: s.newsletter_desc,
    })));

    return (
        <HomeBoxed>
            <HeaderTwo />
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
            <FooterCompsTwo />
        </HomeBoxed>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const products = await getAllProducts();
    const categories = await getCategories();
    const productFilter = buildProductFilters(products, categories);
    const productTab = buildProductTabs(categories);

    return {
        props: {
            products,
            productFilter,
            productTab,
        },
    };
};

export default HomeBoxedPage;
