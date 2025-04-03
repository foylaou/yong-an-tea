export interface ItemData {
    slug: string;
    date?: string;
    isFeatured?: boolean;
    content: string;
    [additionalProperty: string]: string | number | boolean | undefined | string[];
}