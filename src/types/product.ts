export interface Product {
    id: string;
    title: string;
    slug: string;
    xsImage: string;
    smImage: string;
    mdImage: string;
    homeCollectionImg?: string;
    altImage: string;
    price: number;
    discountPrice?: number;
    totalPrice?: number;
    desc: string;
    sku: number;
    category: string;
    availability: string;
    stockQty: number;
    tag: string;
    isFeatured?: boolean;
    soldOutSticker?: string;
    bestSellerSticker?: string;
    offerSticker?: string;
    content?: string;
    date?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface ProductFilterItem {
    id: number;
    title: string;
    categoryList?: { id: number; categoryListTitle: string }[];
    tagList?: { id: number; tagTitle: string }[];
    colorList?: { id: number; colorTitle: string; colorCode: string }[];
    sizeList?: { id: number; sizeTitle: string }[];
}

export interface CategoryBannerItem {
    id: string;
    CName: string;
}
