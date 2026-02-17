import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../types';
import { getAllItems } from '../lib/ItemsUtil';
import { getAllProducts } from '../lib/products-db';
import HeaderThree from '../components/HeaderComps/index-3';
import HeroThree from '../components/Hero/index-3';
import NewArrival from '../components/NewArrival';
import FooterCompsThree from '../components/FooterComps/index-3';
import HomeCarousel from '../components/HomeCarousel';
import { useSettingsStore } from '../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

interface HomeCarouselPageProps {
    footerItems: MarkdownItem[];
    products: MarkdownItem[];
    headerItems: MarkdownItem[];
}

function HomeCarouselPage({
    footerItems,
    products,
    headerItems,
}: HomeCarouselPageProps) {
    const t = useSettingsStore(useShallow((s) => ({
        newArrivalTitle: s.new_arrival_title,
        newArrivalDesc: s.new_arrival_desc,
        viewMore: s.btn_view_more,
        allProducts: s.btn_all_products,
    })));

    return (
        <>
            <HomeCarousel>
                <HeaderThree
                    headerItems={headerItems}
                    logoPath="/home-carousel"
                />
                <HeroThree />
                <NewArrival
                    title={t.newArrivalTitle}
                    desc={t.newArrivalDesc}
                    path="/products/left-sidebar"
                    btnText={t.viewMore}
                    readmoreBtnText={t.allProducts}
                    products={products}
                />
            </HomeCarousel>
            <FooterCompsThree footerItems={footerItems} />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const headerItems = getAllItems('header');
    const products = await getAllProducts();
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            products,
            footerItems,
        },
    };
};

export default HomeCarouselPage;
