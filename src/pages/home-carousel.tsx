import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../types';
import { getAllProducts } from '../lib/products-db';
import HeaderThree from '../components/HeaderComps/index-3';
import HeroThree from '../components/Hero/index-3';
import NewArrival from '../components/NewArrival';
import FooterCompsThree from '../components/FooterComps/index-3';
import HomeCarousel from '../components/HomeCarousel';
import { useSettingsStore } from '../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

interface HomeCarouselPageProps {
    products: MarkdownItem[];
}

function HomeCarouselPage({
    products,
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

export default HomeCarouselPage;
