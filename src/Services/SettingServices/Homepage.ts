// src/Services/SettingServices/Homepage.ts

import { HeroDefaultItem } from "@/components/Hero/HeroTypes";
import {Blog} from "@/components/Blogs/blog-types";


export const HomePage = {
    getBestSellingProduct() {
        // 符合 Product 介面的商品資料
        const products = [
            {
                id: "tea-001",
                slug: "oriental-beauty-tea",
                title: "東方美人茶",
                price: 780,
                image: "/products/oriental-beauty.jpg",
                altImage: "東方美人茶包裝",
                category: "烏龍茶",
                categoryBannerImg: "/banners/oolong-banner.jpg",
                mdImage: "/products/oriental-beauty-md.jpg"
            },
            {
                id: "tea-002",
                slug: "alishan-high-mountain-tea",
                title: "阿里山高山茶",
                price: 650,
                image: "/products/alishan-tea.jpg",
                altImage: "阿里山高山茶包裝",
                category: "高山茶",
                categoryBannerImg: "/banners/high-mountain-banner.jpg",
                mdImage: "/products/alishan-tea-md.jpg"
            },
            // 其他商品...
        ];

        // 符合 ProductFilterItem 介面的篩選條件
        const productFilter = [
            {
                categoryList: [
                    { id: 1, categoryListTitle: "烏龍茶" },
                    { id: 2, categoryListTitle: "紅茶" },
                    { id: 3, categoryListTitle: "綠茶" },
                    { id: 4, categoryListTitle: "高山茶" },
                    { id: 5, categoryListTitle: "季節限定" }
                ],
                availabilityList: [
                    { id: 1, filterLabel: "庫存狀態", title: "庫存充足", name: "庫存充足", key: "in-stock", group: "availability" },
                    { id: 2, filterLabel: "庫存狀態", title: "即將售罄", name: "即將售罄", key: "low-stock", group: "availability" }
                ],
                productSizeList: [
                    { id: 1, filterLabel: "包裝", title: "75g", name: "75g", key: "75g", group: "size" },
                    { id: 2, filterLabel: "包裝", title: "150g", name: "150g", key: "150g", group: "size" },
                    { id: 3, filterLabel: "包裝", title: "300g", name: "300g", key: "300g", group: "size" }
                ],
                tagList: [
                    { id: 1, tagTitle: "禮盒" },
                    { id: 2, tagTitle: "伴手禮" },
                    { id: 3, tagTitle: "蜜香" },
                    { id: 4, tagTitle: "高山" },
                    { id: 5, tagTitle: "限量" }
                ]
            }
        ];

        return {
            products,
            productFilter,
            productFilterPath: "/products",
            sectionTitle: "熱銷茶品",
            settings: {
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false
                }
            }
        };
    },

    getFeaturedProduct() {
        return [
            {
                path: "/products/oriental-beauty-tea",
                image: "/images/products/animi-dolor-pariatur/300x300.jpg",
                altImage: "東方美人茶精緻包裝與茶葉展示",
                subTitle: "傳承百年工藝",
                title: "東方美人茶 – 蜜香珍藏禮盒",
                excerpt: "東方美人茶是台灣特有的半發酵茶，以其獨特的自然蜜香與果香聞名於世。採自海拔800公尺以上茶園，每一口都能品嚐到<strong>台灣高山氣候與土壤</strong>帶來的獨特風味。精緻禮盒包裝，是饋贈親友的最佳選擇。",
                buttonText: "了解更多"
            },
            {
                path: "/products/seasonal-tea-collection",
                image: "/images/products/art-deco-home/285x396.jpg",
                altImage: "四季茶品精選禮盒",
                subTitle: "四季風味",
                title: "四季茶韻 – 台灣茶品精選",
                excerpt: "獨家精選台灣四季代表茶品：春季<strong>文山包種</strong>、夏季<strong>蜜香紅茶</strong>、秋季<strong>高山烏龍</strong>、冬季<strong>東方美人</strong>。每一款茶葉都經過嚴格篩選，保留最純粹的風味，讓您體驗台灣四季的獨特茶韻。",
                buttonText: "立即選購"
            },
            {
                path: "/experiences/tea-tasting",
                image: "/images/products/drinking-glasses/600x429.png",
                altImage: "台東鹿野茶席體驗",
                subTitle: "身心靈體驗",
                title: "鹿野茶席 – 品茗文化之旅",
                excerpt: "在台東鹿野高台的茶園間，我們提供最道地的台灣茶文化體驗。由專業茶師帶領，您將學習傳統<strong>泡茶技藝</strong>、辨別茶葉品質，並在綠意盎然的環境中享受寧靜時光。每週限量場次，建議提前預約。",
                buttonText: "預約體驗"
            }
        ];
    },

    getHeroItems(): HeroDefaultItem[] {
        return [
            {
                id: 1,
                heroBG: "/images/hero/home-default/1.jpg",
                subtitle: "台東鹿野高台",
                title: "品味自然，傳承茶韻",
                desc: "台灣最純淨的風土與手藝，帶給您最道地的茶香體驗"
            },
            {
                id: 2,
                heroBG: "/images/hero/home-default/2.jpg",
                subtitle: "台灣茶文化",
                title: "四季茶韻，一葉知秋",
                desc: "從春到冬，體驗台灣四季茶香，每一款都有其獨特風味"
            }
        ];
    },

    getOfferCollection() {
        return [
            {
                title: "新客限定 - 品茶體驗組",
                desc: "嚴選四款經典茶品小包裝，含專業沖泡指南，讓您在家就能體驗專業茶席"
            },
            {
                title: "高山茶葉禮盒",
                desc: "精緻木盒包裝，內含阿里山烏龍與東方美人茶，送禮自用兩相宜"
            }
        ];
    },

    getLatestBlogs(): Blog[] {
        return [
            {
                id: 1,
                slug: "winter-tea-flavor",
                mediumImage: "/images/hero/home-default/1.jpg",
                largeImage: "/images/hero/home-default/1.jpg",
                extraLargeImage: "/images/hero/home-default/1.jpg",
                altImage: "冬片茶特寫",
                title: "冬片茶的獨特風味",
                date: "2023/12/20",
                author: "陳茶師",
                categoryItem: "茶葉知識",
                desc: "冬季限定的冬片茶為何如此受歡迎？讓我們深入了解這款來自寒冷季節的特色茶品，探索其獨特的風味與香氣。冬片茶是在霜降過後採摘的茶葉，因生長緩慢而積累了豐富的營養與風味...",
                masonry: "grid-wide",
                blockquoteDesc: "冬片茶的甜潤與厚實，體現了大自然賦予的珍貴禮物，每一口都是時光與氣候的完美結合。",
                singleImgOne: "圓形LOGO（白背景）.svg",
                singleImgTwo: "圓形LOGO（白背景）.svg",
                singleImgAlt: "冬片茶製作過程"
            },
            {
                id: 2,
                slug: "tea-and-health",
                mediumImage: "圓形LOGO（白背景）.svg",
                largeImage: "圓形LOGO（白背景）.svg",
                extraLargeImage: "圓形LOGO（白背景）.svg",
                altImage: "品茶與健康",
                title: "茶與健康的奧秘",
                date: "2023/11/05",
                author: "林營養師",
                categoryItem: "健康生活",
                desc: "現代研究揭示台灣特有茶種的健康價值，從抗氧化到心血管健康，一杯好茶的益處遠超我們的想像。近年來，愈來愈多的科學研究證實了茶葉中的兒茶素、茶多酚等成分對人體健康的正面影響...",
                masonry: "grid-small",
                blockquoteDesc: "喝茶不僅是一種生活態度，更是對身體健康的一種投資，適量的茶飲習慣能為我們的生活帶來長久的益處。",
                singleImgOne: "圓形LOGO（白背景）.svg",
                singleImgTwo: "圓形LOGO（白背景）.svg",
                singleImgAlt: "茶與健康研究"
            },
            {
                id: 3,
                slug: "taitung-tea-journey",
                mediumImage: "圓形LOGO（白背景）.svg",
                largeImage: "圓形LOGO（白背景）.svg",
                extraLargeImage: "圓形LOGO（白背景）.svg",
                altImage: "台東茶園風光",
                title: "走訪台東茶園",
                date: "2023/10/12",
                author: "王旅人",
                categoryItem: "旅遊體驗",
                desc: "從台北到台東的茶葉之旅，走訪鹿野高台，探索台灣最美的茶園風光與茶文化傳承。台東的茶園多分布在海拔500至1200公尺的山區，這裡日夜溫差大、霧氣充足，是培育優質茶葉的絕佳環境...",
                masonry: "grid-wide",
                blockquoteDesc: "站在鹿野高台俯瞰茶園，綠意盎然的梯田與雲霧繚繞的山景相映成趣，讓人不禁感嘆大自然的鬼斧神工。",
                singleImgOne: "圓形LOGO（白背景）.svg",
                singleImgTwo: "圓形LOGO（白背景）.svg",
                singleImgAlt: "台東鹿野高台風景"
            }
        ];
    }
};