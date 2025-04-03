import { JSX } from "react";
import MainContent from "@/components/Products/ProductDetails/MainContent";
import ProductDetailTab from "@/components/Products/ProductDetails/ProductDetailTab";
import { ExtendedProduct } from "@/components/Products/ProductsTypes";

// 針對 ProductDetailTab 組件所需的類型
interface TabMenuItem {
    id: number;
    name: string;
    tabStateNumber: number;
    tabMenuItemCName: string;
    separatorCName?: string;
}

interface FeatureList {
    id: number;
    name: string;
}

interface InfoThItem {
    id: number;
    infoThName: string;
    infoThValue: string;
}

interface RatingList {
    id: number;
}

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

interface ProductDetailsProps {
    product: ExtendedProduct; // 使用 ExtendedProduct 而不是 Product
    productDetailTabItems: ProductDetailTabItem[]; // 修正為 ProductDetailTab 組件需要的類型
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