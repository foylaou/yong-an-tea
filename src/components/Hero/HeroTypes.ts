/**
 * Hero 區塊預設項目的介面
 *
 * @interface HeroDefaultItem
 * @member {number | string} id 項目唯一識別碼
 * @member {string} heroBG 背景圖片 URL
 * @member {string} subtitle 副標題
 * @member {string} title 主標題
 * @member {string} desc 描述文字
 */
export interface HeroDefaultItem {
    id: number | string;
    heroBG: string;
    subtitle: string;
    title: string;
    desc: string;
}

