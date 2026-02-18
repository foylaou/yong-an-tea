import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../types';
import { getAllProducts } from '../lib/products-db';
import HomeCollection from '../components/HomeCollection';
import HeaderFour from '../components/HeaderComps/index-4';
import HeroFour from '../components/Hero/index-4';
import NewsletterCompsThree from '../components/NewsletterComps/index-3';
import NewArrivalTwo from '../components/NewArrival/index-2';
import FooterCompsThree from '../components/FooterComps/index-3';
import { useSettingsStore } from '../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

interface HomeCollectionPageProps {
    products: MarkdownItem[];
}

function HomeCollectionPage({
    products,
}: HomeCollectionPageProps) {
    const t = useSettingsStore(useShallow((s) => ({
        shopNow: s.btn_shop_now,
        newsletterV3: s.section_title_newsletter_v3,
        newsletterDescV3: s.newsletter_desc_v3,
        newArrivalExcerpt: s.new_arrival_excerpt,
    })));

    return (
        <>
            <HomeCollection>
                <HeaderFour />
                <HeroFour btnText={t.shopNow} />
                <NewsletterCompsThree
                    newsletterCName="newsletter-area lg:pt-[95px] md:pt-[75px] pt-[45px]"
                    sectionTitle={t.newsletterV3}
                    sectionDesc={t.newsletterDescV3}
                    containerCName="container"
                />
                <NewArrivalTwo
                    products={products}
                    excerpt={t.newArrivalExcerpt}
                    btnText={t.shopNow}
                />
            </HomeCollection>
            <FooterCompsThree />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const products = await getAllProducts();

    return {
        props: {
            products,
        },
    };
};

export default HomeCollectionPage;
