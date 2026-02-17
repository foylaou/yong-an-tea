import type { MarkdownItem } from '../../types';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

// Headers
import TransparentHeader from '../HeaderComps/TransparentHeader';
import HeaderOne from '../HeaderComps';
import HeaderTwo from '../HeaderComps/index-2';
import HeaderThree from '../HeaderComps/index-3';
import HeaderFour from '../HeaderComps/index-4';

// Footers
import FooterComps from '../FooterComps';
import FooterCompsTwo from '../FooterComps/index-2';
import FooterCompsThree from '../FooterComps/index-3';

// Variant 1 components
import HeroOne from '../Hero';
import FeaturedProduct from '../HomePage/FeaturedProduct';
import BestSellingProduct from '../HomePage/BestSellingProduct';
import OfferColection from '../OfferColection';
import LatestBlog from '../HomePage/LatestBlog';
import NewsletterComps from '../NewsletterComps';

// Variant 2 components
import HomeBoxed from '../HomeBoxed';
import HeroTwo from '../Hero/index-2';
import VideoModalTwo from '../VideoModal/index-2';
import ProductTab from '../ProductTab';
import Brand from '../Brand';
import NewsletterCompsTwo from '../NewsletterComps/index-2';

// Variant 3 components
import HomeCarousel from '../HomeCarousel';
import HeroThree from '../Hero/index-3';
import NewArrival from '../NewArrival';

// Variant 4 components
import CategoriesBanner from '../CategoriesBanner';
import LatestBlogTwo from '../HomePage/LatestBlogTwo';

// Variant 5 components
import HomeCollection from '../HomeCollection';
import HeroFour from '../Hero/index-4';
import NewsletterCompsThree from '../NewsletterComps/index-3';
import NewArrivalTwo from '../NewArrival/index-2';

export interface DynamicHomeContentProps {
    headerItems: MarkdownItem[];
    footerItems: MarkdownItem[];
    // Shared
    products: MarkdownItem[];
    productFilter: MarkdownItem[];
    // Variant 1
    blogs: MarkdownItem[];
    // Variant 2
    productTab: MarkdownItem[];
}

function DynamicHomeContent(props: DynamicHomeContentProps) {
    const homepageVariant = useSettingsStore((s) => s.homepage_variant);
    const t = useSettingsStore(useShallow((s) => ({
        bestselling: s.section_title_bestselling,
        latestBlog: s.section_title_latest_blog,
        exploreBlog: s.section_title_explore_blog,
        popularProducts: s.section_title_popular_products,
        newsletter: s.section_title_newsletter,
        newsletterDesc: s.newsletter_desc,
        newsletterV3: s.section_title_newsletter_v3,
        newsletterDescV3: s.newsletter_desc_v3,
        shopNow: s.btn_shop_now,
        viewMore: s.btn_view_more,
        viewAll: s.btn_view_all,
        allProducts: s.btn_all_products,
        newArrivalTitle: s.new_arrival_title,
        newArrivalDesc: s.new_arrival_desc,
        newArrivalExcerpt: s.new_arrival_excerpt,
    })));

    switch (homepageVariant) {
        case 2:
            return (
                <HomeBoxed>
                    <HeaderTwo headerItems={props.headerItems} logoPath="/" />
                    <HeroTwo />
                    <VideoModalTwo
                        containerCName="homebox-container xl:mx-[100px] mx-[15px]"
                    />
                    <ProductTab
                        products={props.products}
                        productTab={props.productTab}
                        tabTitle={t.popularProducts}
                        containerCName="homebox-container xl:mx-[100px] mx-[15px]"
                        productFilter={props.productFilter}
                        productFilterPath="left-sidebar"
                    />
                    <Brand />
                    <NewsletterCompsTwo
                        newsletterCName="newsletter-area"
                        sectionTitle={t.newsletter}
                        sectionDesc={t.newsletterDesc}
                        containerCName="homebox-container xl:mx-[100px] mx-[15px] bg-[#f4f5f7] py-[50px] lg:px-[70px] px-[15px]"
                    />
                    <FooterCompsTwo footerItems={props.footerItems} />
                </HomeBoxed>
            );
        case 3:
            return (
                <>
                    <HomeCarousel>
                        <HeaderThree
                            headerItems={props.headerItems}
                            logoPath="/"
                        />
                        <HeroThree />
                        <NewArrival
                            title={t.newArrivalTitle}
                            desc={t.newArrivalDesc}
                            path="/products/left-sidebar"
                            btnText={t.viewMore}
                            readmoreBtnText={t.allProducts}
                            products={props.products}
                        />
                    </HomeCarousel>
                    <FooterCompsThree footerItems={props.footerItems} />
                </>
            );
        case 4:
            return (
                <>
                    <HeaderOne
                        headerItems={props.headerItems}
                        headerContainer="container"
                    />
                    <CategoriesBanner
                        categoryBannerCName="category-banner-area pt-[25px]"
                        products={props.products}
                    />
                    <VideoModalTwo
                        containerCName="container"
                    />
                    <ProductTab
                        products={props.products}
                        productTab={props.productTab}
                        tabTitle={t.popularProducts}
                        containerCName="container"
                        productFilter={props.productFilter}
                        productFilterPath="left-sidebar"
                    />
                    <LatestBlogTwo
                        blogs={props.blogs}
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
                        footerItems={props.footerItems}
                    />
                </>
            );
        case 5:
            return (
                <>
                    <HomeCollection>
                        <HeaderFour headerItems={props.headerItems} />
                        <HeroFour btnText={t.shopNow} />
                        <NewsletterCompsThree
                            newsletterCName="newsletter-area lg:pt-[95px] md:pt-[75px] pt-[45px]"
                            sectionTitle={t.newsletterV3}
                            sectionDesc={t.newsletterDescV3}
                            containerCName="container"
                        />
                        <NewArrivalTwo
                            products={props.products}
                            excerpt={t.newArrivalExcerpt}
                            btnText={t.shopNow}
                        />
                    </HomeCollection>
                    <FooterCompsThree footerItems={props.footerItems} />
                </>
            );
        default:
            return (
                <>
                    <TransparentHeader headerItems={props.headerItems} />
                    <HeroOne />
                    <FeaturedProduct />
                    <BestSellingProduct
                        products={props.products}
                        productFilter={props.productFilter}
                        sectionTitle={t.bestselling}
                        productFilterPath="left-sidebar"
                    />
                    <OfferColection />
                    <LatestBlog blogs={props.blogs} sectionTitle={t.latestBlog} />
                    <NewsletterComps sectionTitle={t.newsletter} />
                    <FooterComps
                        footerContainer="container"
                        footerItems={props.footerItems}
                    />
                </>
            );
    }
}

export default DynamicHomeContent;
