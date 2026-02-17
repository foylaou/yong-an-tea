interface LevelTwoItem {
    id: string;
    link: string;
    text: string;
}

interface SubmenuItem {
    id: string;
    link: string;
    text: string;
    cName: string;
    levelTwo?: LevelTwoItem[];
}

interface OffcanvasMenuItem {
    id: number;
    title: string;
    cName: string;
    submenu: SubmenuItem[];
}

export const OffcanvasData: OffcanvasMenuItem[] = [
    {
        id: 1,
        title: '首頁',
        cName: '',
        submenu: [
            {
                id: 'home-01',
                link: '/',
                text: '首頁',
                cName: '',
            },
        ],
    },
    {
        id: 2,
        title: '商品',
        cName: 'has-children',
        submenu: [
            {
                id: 'product-categories',
                link: '/products/categories',
                text: '商品分類',
                cName: '',
            },
            {
                id: 'cart',
                link: '/cart',
                text: '購物車',
                cName: '',
            },
            {
                id: 'wishlist',
                link: '/wishlist',
                text: '願望清單',
                cName: '',
            },
        ],
    },
    {
        id: 3,
        title: '頁面',
        cName: 'has-children',
        submenu: [
            {
                id: 'other-01',
                link: '/about',
                text: '關於我們',
                cName: '',
            },
            {
                id: 'other-02',
                link: '/contact',
                text: '聯絡我們',
                cName: '',
            },
            {
                id: 'other-03',
                link: '/faq',
                text: '常見問題',
                cName: '',
            },
        ],
    },
    {
        id: 4,
        title: '部落格',
        cName: '',
        submenu: [
            {
                id: 'blog-sidebar',
                link: '/blogs/sidebar',
                text: '部落格',
                cName: '',
            },
        ],
    },
];
