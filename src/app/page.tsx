// src/app/page.tsx
import BestSellingProduct from "@/components/HomePage/BestSellingProduct";
import FeaturedProduct from "@/components/HomePage/FeaturedProduct";
import LatestBlog from "@/components/HomePage/LatestBlog";
import { HomePage } from "@/Services/SettingServices/Homepage";
import HeroOne from "@/components/Hero/HeroOne";
// import OfferColection from "@/components/OfferColection/OfferColection";
import NewsletterComps from "@/components/NewsletterComps/NewsletterComps";
import TransparentHeader from "@/components/HeaderComps/TransparentHeader";
import {HeaderMenuService} from "@/Services/SettingServices/HeaderMenuService";
// import HomeCarousel from "@/components/HomeCarousel/HomeCarousel";
import HomeBoxed from "@/components/HomeBoxed/HomeBoxed";


export default function Page() {
    // 獲取所有數據
    const { products, productFilter, productFilterPath, sectionTitle, settings } = HomePage.getBestSellingProduct();
    const featuredProduct = HomePage.getFeaturedProduct();

    // const offerCollection = HomePage.getOfferCollection();
    const blogs = HomePage.getLatestBlogs();
    const heroItems = HomePage.getHeroItems();
    const data = HeaderMenuService.getHeaderMenuSetting();
    return (
        <>
            <header className="header-contact">
            <TransparentHeader headerItems={data} />
            </header>
            <HeroOne heroDefaultItems={heroItems} />
            {/* 特色產品區 */}

            <FeaturedProduct featuredProduct={featuredProduct} />

            {/* 熱銷商品區 */}
            <BestSellingProduct
                products={products}
                productFilter={productFilter}
                productFilterPath={productFilterPath}
                sectionTitle={sectionTitle}
                settings={settings}
            />

            {/* 優惠活動區 */}
            {/*<OfferColection offerColection={offerCollection} />*/}

            {/* 最新部落格區 */}

            <LatestBlog blogs={blogs} sectionTitle="最新消息" />

            {/* 電子報訂閱區 */}
            <NewsletterComps sectionTitle="訂閱電子報" />

        </>
    );
}
