// src/app/page.tsx
import BestSellingProduct from "@/components/HomePage/BestSellingProduct";
import FeaturedProduct from "@/components/HomePage/FeaturedProduct";
import LatestBlog from "@/components/HomePage/LatestBlog";
import { HomePage } from "@/Services/SettingServices/Homepage";
import HeroOne from "@/components/Hero/HeroOne";
import NewsletterComps from "@/components/NewsletterComps/NewsletterComps";



export default function Page() {
    // 獲取所有數據
    const { products, productFilter, productFilterPath, sectionTitle, settings } = HomePage.getBestSellingProduct();
    const featuredProduct = HomePage.getFeaturedProduct();

    // const offerCollection = HomePage.getOfferCollection();
    const blogs = HomePage.getLatestBlogs();
    const heroItems = HomePage.getHeroItems();

    return (
        <>

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

            <LatestBlog blogs={blogs} sectionTitle="最新消息" />


            {/* 電子報訂閱區 */}
            <NewsletterComps
              sectionTitle="訂閱電子報"
              description="搶先獲取獨家優惠，讓好康資訊不再錯過！"
            />

        </>
    );
}
