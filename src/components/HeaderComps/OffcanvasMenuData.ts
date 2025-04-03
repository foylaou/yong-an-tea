// 定義 OffcanvasData 數組
import {MenuItem} from "@/components/HeaderComps/MenuType";

export const OffcanvasData: MenuItem[] = [
    {
        id: 1,
        title: '首頁',
        link: '/',
        cName: 'home-menu',
    },
    {
        id: 2,
        title: '商品分類',
        cName: 'category-menu',
        submenu: [
            {
                id: 21,
                text: '茶葉',
                link: '/products/tea',
                cName: 'tea-submenu',
                levelTwo: [
                    {
                        id: 211,
                        text: '高山茶',
                        link: '/products/tea/high-mountain'
                    },
                    {
                        id: 212,
                        text: '烏龍茶',
                        link: '/products/tea/oolong'
                    }
                ]
            },
            {
                id: 22,
                text: '茶具',
                link: '/products/teaware',
                cName: 'teaware-submenu',
                levelTwo: [
                    {
                        id: 221,
                        text: '茶壺',
                        link: '/products/teaware/teapot'
                    },
                    {
                        id: 222,
                        text: '茶杯',
                        link: '/products/teaware/teacup'
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        title: '關於我們',
        link: '/about',
        cName: 'about-menu',
    },
    {
        id: 4,
        title: '最新消息',
        link: '/news',
        cName: 'news-menu',
    },
    {
        id: 5,
        title: '聯繫我們',
        link: '/contact',
        cName: 'contact-menu',
    }
];