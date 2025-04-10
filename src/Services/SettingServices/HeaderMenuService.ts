// src/services/SettingServices/HeaderMenuService.ts



import {HeaderItem} from "@/components/HeaderComps/MenuType";

export const HeaderMenuService = {
    getHeaderMenuSetting(): HeaderItem[] {
        return [
            {
                headerLogo: [
                    {
                        darkLogo: '圓形LOGO（白背景）.svg',
                        darkLogoAlt: '永安茶行 LOGO',
                    },
                ],
                languageTitle: '語言',
                languageList: [
                    { id: 1, path: '/zh-TW', text: '繁體中文', title: '繁中' },
                    { id: 2, path: '/en', text: 'English', title: '英文' },
                ],
                currencyTitle: '幣別',
                currencyList: [
                    { id: 1, path: '#', text: 'TWD', title: '新台幣' },
                    { id: 2, path: '#', text: 'USD', title: '美金' },
                ],
                contactInfoTitle: '聯絡我們',
                contactInfo: '台中市西區公益路100號',
                socialTitle: '社群',
                socialList: [
                    { id: 1, socialIcon: 'IoLogoFacebook', path: 'https://facebook.com' },
                    { id: 2, socialIcon: 'IoLogoInstagram', path: 'https://instagram.com' },
                ],
                navigationList: [
                    { id: 1, text: '首頁', path: '/' },
                    { id: 2, text: '部落格', path: '/blogs' },
                    { id: 3, text: '隱私政策', path: '/privacy' },
                ],
                headerNumberInfo: [
                    {
                        id: 1,
                        numberUrl: 'tel:+88689550818',
                        numberInText: '(089) 550-818',
                    },
                ],
                homeBoxedMenu: [
                    {
                        id: 1,
                        title: '商品',
                        path: '/products',
                        holderCName: 'has-submenu',
                        submenuCName: 'submenu',
                        headerSubmenu: [
                            {
                                id: 1,
                                submenuTitle: '全部商品',
                                submenuPath: '/products',
                            },
                            {
                                id: 2,
                                submenuTitle: '茶葉禮盒',
                                submenuPath: '/products/gift',
                            },
                        ],
                    },
                    {
                        id: 2,
                        title: '品牌介紹',
                        path: '/about',
                        holderCName: '',
                    },
                    {
                        id: 3,
                        title: '茶知識',
                        holderCName: 'has-megamenu',
                        megamenuCName: 'megamenu',
                        headerMegamenu: [
                            {
                                id: 1,
                                groupName: '台灣茶',
                                groupItems: [
                                    {
                                        id: 1,
                                        megamenuTitle: '凍頂烏龍',
                                        megamenuPath: '/knowledge/oolong',
                                    },
                                    {
                                        id: 2,
                                        megamenuTitle: '高山茶',
                                        megamenuPath: '/knowledge/high-mountain',
                                    },
                                ],
                            },
                            {
                                id: 2,
                                groupName: '沖泡方法',
                                groupItems: [
                                    {
                                        id: 3,
                                        megamenuTitle: '冷泡茶',
                                        megamenuPath: '/knowledge/cold-brew',
                                    },
                                    {
                                        id: 4,
                                        megamenuTitle: '功夫茶泡法',
                                        megamenuPath: '/knowledge/kungfu-tea',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4,
                        title: '聯絡我們',
                        path: '/contact',
                    },
                ],
                categoryList: [
                    { id: 1, path: '/category/green-tea', text: '綠茶', title: 'Green Tea' },
                    { id: 2, path: '/category/black-tea', text: '紅茶', title: 'Black Tea' },
                ],
            },
        ];
    },
};
