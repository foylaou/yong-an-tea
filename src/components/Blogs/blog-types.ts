/**
 * 部落格文章資料結構
 * 表示單篇部落格的完整資訊。
 *
 * @interface Blog
 * @member {string | number} id 唯一識別碼
 * @member {string} slug 網址用的短代稱（通常為英文）
 * @member {string} mediumImage 中尺寸圖片 URL
 * @member {string} largeImage 大尺寸圖片 URL
 * @member {string} altImage 圖片替代文字（無法顯示時會顯示此文字）
 * @member {string} title 文章標題
 * @member {string} date 發佈日期
 * @member {string} author 作者名稱
 * @member {string} authorInfo 作者介紹連結
 * @member {string} categoryItem 分類名稱
 * @member {string} desc 摘要或敘述文字
 * @member {string} masonry 瀑布流樣式用屬性（例如圖片 URL 或識別碼）
 * @member {string} extraLargeImage 超大尺寸圖片 URL
 * @member {string} blockquoteDesc 引用區塊的描述文字
 * @member {string} singleImgOne 單篇內容中的第一張圖片
 * @member {string} singleImgTwo 單篇內容中的第二張圖片
 * @member {string} singleImgAlt 單篇內容圖片的替代文字
 */
export interface Blog {
    id: string | number;
    slug: string;
    mediumImage: string;
    largeImage: string;
    altImage: string;
    title: string;
    date: string;
    author: string;
    authorInfo: string;
    categoryItem: string;
    desc: string;
    masonry: string;
    extraLargeImage: string;
    blockquoteDesc: string;
    singleImgOne: string;
    singleImgTwo: string;
    singleImgAlt: string;
}




