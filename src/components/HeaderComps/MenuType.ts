// src/components/helendo/HeaderComps/MenuType.ts
/**
 * 選單項目的介面
 *
 * @interface MenuItem
 * @member {number | string} id 選單項目唯一識別碼
 * @member {string} [title] 選單標題
 * @member {string} [text] 選單文字
 * @member {string} [link] 對應的連結
 * @member {string} [cName] CSS 類名
 * @member {MenuItem[]} [submenu] 子選單清單
 * @member {MenuItem[]} [levelTwo] 第二層子選單清單
 */
export interface MenuItem {
    id: number | string;
    title?: string;
    text?: string;
    link?: string;
    cName?: string;
    submenu?: MenuItem[];
    levelTwo?: MenuItem[];
}


/**
 * 語言與貨幣列表項目的介面
 *
 * @interface ListItem
 * @member {number | string} id 項目唯一識別碼
 * @member {string} path 對應的路徑
 * @member {string} text 顯示文字
 * @member {string} title 顯示標題
 */
export interface ListItem {
    id: number | string;
    path: string;
    text: string;
    title: string;
}

/**
 * 社群媒體列表項目的介面
 *
 * @interface SocialItem
 * @member {number | string} id 項目唯一識別碼
 * @member {string} socialIcon 社群圖示類別名稱
 * @member {string} path 對應的連結
 */
export interface SocialItem {
    id: number | string;
    socialIcon: string;
    path: string;
}

/**
 * Header 組件資料介面
 *
 * @interface HeaderItem
 * @member {string} [languageTitle] 語言標題
 * @member {ListItem[]} [languageList] 語言選單清單
 * @member {string} [currencyTitle] 貨幣標題
 * @member {ListItem[]} [currencyList] 貨幣選單清單
 * @member {string} [contactInfoTitle] 聯絡資訊標題
 * @member {string} [contactInfo] 聯絡資訊
 * @member {string} [socialTitle] 社群標題
 * @member {SocialItem[]} [socialList] 社群清單
 * @member {string} [logo] Logo 圖片 URL
 * @member {string} [logoAlt] Logo 替代文字
 * @member {HeaderItemLink[]} [navigationList] 導覽列連結清單
 * @member {HeaderNumberInfo[]} [headerNumberInfo] 聯絡電話清單
 * @member {ExtendedMenuItem[]} [homeBoxedMenu] 首頁選單項目清單
 * @member {ListItem[]} [categoryList] 類別清單
 */
export interface HeaderItem {
    languageTitle?: string;
    languageList?: ListItem[];
    currencyTitle?: string;
    currencyList?: ListItem[];
    contactInfoTitle?: string;
    contactInfo?: string;
    socialTitle?: string;
    socialList?: SocialItem[];
    logo?: string;
    logoAlt?: string;
    navigationList?: HeaderItemLink[];
    headerNumberInfo?: HeaderNumberInfo[];
    homeBoxedMenu?: ExtendedMenuItem[];
    categoryList?: ListItem[];
    headerLogo: Logo[];
}
interface Logo {
    darkLogo: string;
    darkLogoAlt: string;
}
/**
 * 延伸的選單項目介面，繼承自 MenuItem
 *
 * @interface ExtendedMenuItem
 * @extends MenuItem
 * @member {string} [holderCName] 包裝容器的 CSS 類名
 * @member {string} [submenuCName] 子選單 CSS 類名
 * @member {string} [megamenuCName] 巨型選單 CSS 類名
 * @member {string} [path] 對應的連結
 * @member {HeaderSubmenuItem[]} [headerSubmenu] Header 專用子選單
 * @member {HeaderMegamenuGroup[]} [headerMegamenu] Header 巨型選單群組
 */
export interface ExtendedMenuItem extends MenuItem {
    holderCName?: string;
    submenuCName?: string;
    megamenuCName?: string;
    path?: string;
    headerSubmenu?: HeaderSubmenuItem[];
    headerMegamenu?: HeaderMegamenuGroup[];
}
/**
 * Header 專用的子選單項目介面
 *
 * @interface HeaderSubmenuItem
 * @member {number | string} id 子選單項目唯一識別碼
 * @member {string} submenuPath 對應的路徑
 * @member {string} submenuTitle 子選單標題
 */
export interface HeaderSubmenuItem {
    id: number | string;
    submenuPath: string;
    submenuTitle: string;
}
/**
 * Header 巨型選單群組介面
 *
 * @interface HeaderMegamenuGroup
 * @member {number | string} id 群組唯一識別碼
 * @member {string} groupName 群組名稱
 * @member {HeaderMegamenuGroupItem[]} [groupItems] 群組項目清單
 */
export interface HeaderMegamenuGroup {
    id: number | string;
    groupName: string;
    groupItems?: HeaderMegamenuGroupItem[];
}

/**
 * Header 巨型選單群組項目介面
 *
 * @interface HeaderMegamenuGroupItem
 * @member {number | string} id 項目唯一識別碼
 * @member {string} megamenuPath 對應的路徑
 * @member {string} megamenuTitle 項目標題
 */
export interface HeaderMegamenuGroupItem {
    id: number | string;
    megamenuPath: string;
    megamenuTitle: string;
}

/**
 * Header 導覽列連結項目介面
 *
 * @interface HeaderItemLink
 * @member {number | string} id 項目唯一識別碼
 * @member {string} [text] 顯示文字
 * @member {string} [path] 對應的路徑
 */
export interface HeaderItemLink {
    id: number | string;
    text?: string;
    path?: string;
}

/**
 * Header 聯絡電話資訊介面
 *
 * @interface HeaderNumberInfo
 * @member {number | string} id 項目唯一識別碼
 * @member {string} numberUrl 電話連結
 * @member {string} numberInText 顯示電話文字
 */
export interface HeaderNumberInfo {
    id: number | string;
    numberUrl: string;
    numberInText: string;
}