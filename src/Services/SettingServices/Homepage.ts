// src/Services/SettingServices/Homepage.ts

import { HeroDefaultItem } from "@/components/Hero/HeroTypes";
import {Blog} from "@/components/Blogs/blog-types";


export const HomePage = {
    getBestSellingProduct() {
        // 符合 Product 介面的商品資料
        const products = [
            {
                id: "tea-002",
                slug: "taitung-red-oolong",
                title: "紅烏龍",
                price: 600,
                image: "紅烏龍.jpg",
                altImage: "紅烏龍茶四兩裝",
                category: "烏龍茶",
                categoryBannerImg: "紅烏龍.jpg",
                mdImage: "/images/products/紅烏龍.jpg"
            },
            {
                id: "tea-003",
                slug: "buzhichun",
                title: "不知春",
                price: 720,
                image: "/base/不知春.jpg",
                altImage: "不知春高山茶包裝",
                category: "高山茶",
                categoryBannerImg: "/base/不知春.jpg",
                mdImage: "/images/products/不知春.jpg"
            },
            {
                id: "tea-004",
                slug: "fulu-winter-tea",
                title: "福鹿冬片",
                price: 750,
                image: "/base/福鹿冬片.jpg",
                altImage: "福鹿冬片茶葉與包裝展示",
                category: "高山茶",
                categoryBannerImg: "/base/福鹿冬片.jpg",
                mdImage: "/images/products/福鹿冬片.jpg"
            }

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
                path: "/products/taitung-red-oolong",
                image: "/images/products/紅烏龍禮盒.jpg",
                altImage: "台東紅烏龍茶葉與質感包裝展示",
                subTitle: "山海交織的風土韻味",
                title: "台東紅烏龍 – 限量熟香禮盒",
                excerpt: "台東紅烏龍是融合紅茶發酵工藝與烏龍茶焙火技術的創新茶品，產自台東縱谷，擁有獨特的熟果香與柔順口感。<strong>日照充足、山海氣候交匯</strong>，造就茶葉醇厚層次與自然甜韻。高雅禮盒設計，是展現品味的理想之選。",
                buttonText: "了解更多"
            },
            {
                path: "/products/taitung-red-oolong-tea-cake",
                image: "/images/products/紅烏龍手工茶餅.jpg",
                altImage: "紅烏龍手工茶餅外觀與壓製細節展示",
                subTitle: "手工壓製・陳藏之美",
                title: "紅烏龍手工茶餅 – 陳年熟香典藏款",
                excerpt: "紅烏龍手工茶餅結合紅茶的溫潤與烏龍的層次，以傳統手工方式壓製成餅，利於長期保存與陳化。茶葉來自台東純淨山區，<strong>焙火細緻、熟果香濃郁</strong>，入口圓潤滑順。無論自飲或收藏，皆為茶人極品首選。",
                buttonText: "了解更多"

            },
            {
                path: "/products/fulu-winter-tea",
                image: "/images/products/福鹿冬片.jpg",
                altImage: "福鹿冬片茶葉與高山茶園風景",
                subTitle: "冬盡春初的珍稀香韻",
                title: "福鹿冬片 – 高冷限量珍品",
                excerpt: "福鹿冬片為冬季茶後僅少量萌芽的新茶，來自南投鹿谷福鹿山區，氣候冷冽、日夜溫差大，使茶葉孕育出<strong>淡雅花香與細緻甘韻</strong>。手工採摘、輕焙保鮮，每一泡都彷彿啜飲冬末春初的山嵐清氣，是高山茶迷心中的夢幻逸品。",
                buttonText: "了解更多"
            }
        ];
    },

    getHeroItems(): HeroDefaultItem[] {
        return [
            {
                id: 1,
                heroBG: "/pixabay/green-tea-5301025.jpg",
                subtitle: "台東鹿野高台",
                title: "品味自然，傳承茶韻",
                desc: "台灣最純淨的風土與手藝，帶給您最道地的茶香體驗"
            },
            {
                id: 2,
                heroBG: "/pixabay/tea-6069409.jpg",
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
                authorInfo:"#",
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
                authorInfo:"#",
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
                authorInfo:"#",
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
