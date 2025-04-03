/**
 * 單一 Grid 模式選項
 *
 * @interface GridTabListItem
 * @property {number} id 唯一識別碼
 * @property {number} tabStateNo 對應的 tab 狀態值
 * @property {string} gridColumnImg 模式圖示圖片路徑
 * @property {string} gridImgAlt 圖片替代文字
 * @property {string} gridColumns 對應的 Tailwind CSS 格線 class
 */
export interface GridTabListItem {
    id: number;
    tabStateNo: number;
    gridColumnImg: string;
    gridImgAlt: string;
    gridColumns: string;
}

/**
 * GridTab 列表容器
 *
 * @interface GridTabItems
 * @property {GridTabListItem[]} gridTabList Grid 模式清單
 */
export interface GridTabItems {
    gridTabList: GridTabListItem[];
}

/**
 * 商品資料介面
 *
 * @interface Product
 * @property {string} id 商品 ID
 * @property {string} slug 商品網址代稱
 * @property {string} title 商品名稱
 * @property {number} price 商品價格
 * @property {string} [image] 商品圖片（可選）
 * @property {string} [altImage] 圖片替代文字（可選）
 * @property {string} [category] 商品分類（可選）
 * @property {string} [categoryBannerImg] 分類橫幅圖片（可選）
 */
export interface Product {
    id: string;
    slug: string;
    title: string;
    price: number;
    image?: string;                  // 明確為可選
    altImage?: string;               // 明確為可選，刪除 "| ''"
    category?: string;
    categoryBannerImg?: string;
}

/**
 * 篩選條件資料格式
 *
 * @interface FilterDataItem
 * @property {string} group 篩選群組，例如 category、brand...
 * @property {string} key 篩選條件 key，例如 "綠茶"
 * @property {{ fromPrice: number; toPrice: number }} [data] 價格篩選區間（可選）
 */
export interface FilterDataItem {
    group: string;
    key: string;
    data?: {
        fromPrice: number;
        toPrice: number;
    };
}

export interface CategoryListItem {
    id: number;
    categoryListTitle: string;
}

export interface FilterItem {
    id: number;
    filterLabel: string;
    title: string;
    name: string;
    key: string;
    group: string;
    checked?: string;
}

export interface ColorListItem {
    id: number;
    colorOption: string;
}

export interface TagListItem {
    id: number;
    tagTitle: string;
    marginRight?: string;
}

export interface ProductFilterItem {
    categoryList?: CategoryListItem[];
    availabilityList?: FilterItem[];
    productSizeList?: FilterItem[];
    colorList?: ColorListItem[];
    tagList?: TagListItem[];
}
export interface FilterState {
    filterData: { key: string }[];
}

export interface FilterData {
    title: string;
    key: string;
    group: string;
    data?: {
        fromPrice: string;
        toPrice: string;
    };
}

export interface RootState {
    filter: {
        filterData: FilterData[];
    };
}