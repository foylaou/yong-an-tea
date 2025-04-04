"use client";
import { JSX } from "react";
import MainContent from "@/components/Products/ProductDetails/MainContent";
import ProductDetailTab from "@/components/Products/ProductDetails/ProductDetailTab";
import { ExtendedProduct } from "@/components/Products/ProductsTypes";

/**
 * 分頁選單項目
 *
 * @interface TabMenuItem
 * @member {number} id 分頁項目的唯一識別碼
 * @member {string} name 分頁名稱
 * @member {number} tabStateNumber 分頁狀態編號
 * @member {string} tabMenuItemCName 分頁項目的中文名稱
 * @member {string} [separatorCName] 分隔線中文名稱（可選）
 */
interface TabMenuItem {
    id: number;
    name: string;
    tabStateNumber: number;
    tabMenuItemCName: string;
    separatorCName?: string;
}

/**
 * 功能列表項目
 *
 * @interface FeatureList
 * @member {number} id 功能項目的唯一識別碼
 * @member {string} name 功能名稱
 */
interface FeatureList {
    id: number;
    name: string;
}

/**
 * 資訊表格標題項目
 *
 * @interface InfoThItem
 * @member {number} id 標題項目的唯一識別碼
 * @member {string} infoThName 資訊欄位名稱
 * @member {string} infoThValue 資訊欄位對應的值
 */
interface InfoThItem {
    id: number;
    infoThName: string;
    infoThValue: string;
}

/**
 * 評分列表項目
 *
 * @interface RatingList
 * @member {number} id 評分項目的唯一識別碼
 */
interface RatingList {
    id: number;
}

/**
 * 商品詳細分頁資訊項目
 *
 * @interface ProductDetailTabItem
 * @member {TabMenuItem[]} tabMenuItems 分頁選單項目陣列
 * @member {string} descriptionTitle 商品描述標題
 * @member {string} descriptionExcerpt 商品描述摘要
 * @member {string} featureTitle 功能標題
 * @member {FeatureList[]} featuresList 商品功能列表
 * @member {InfoThItem[]} infoThList 資訊表格資料列表
 * @member {string} reviewHeading 評論標題
 * @member {string} reviewTitle 評論副標題
 * @member {RatingList[]} ratingLists 評分項目列表
 */
interface ProductDetailTabItem {
    tabMenuItems: TabMenuItem[];
    descriptionTitle: string;
    descriptionExcerpt: string;
    featureTitle: string;
    featuresList: FeatureList[];
    infoThList: InfoThItem[];
    reviewHeading: string;
    reviewTitle: string;
    ratingLists: RatingList[];
}

/**
 * 商品詳細資訊元件的屬性
 *
 * @interface ProductDetailsProps
 * @member {ExtendedProduct} product 擴展後的商品資料
 * @member {ProductDetailTabItem[]} productDetailTabItems 商品詳細分頁資料陣列
 */
interface ProductDetailsProps {
    product: ExtendedProduct;
    productDetailTabItems: ProductDetailTabItem[];
}

export default function ProductDetails({
                                           product,
                                           productDetailTabItems
                                       }: ProductDetailsProps): JSX.Element {
    return (
        <main>
            <MainContent product={product} />
            <ProductDetailTab
                product={product}
                productDetailTabItems={productDetailTabItems}
            />
        </main>
    );
}