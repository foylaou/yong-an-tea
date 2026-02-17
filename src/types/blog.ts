export interface Blog {
    id: string;
    title: string;
    slug: string;
    mediumImage: string;
    masonry?: string;
    largeImage: string;
    extraLargeImage: string;
    altImage: string;
    date: string;
    author: string;
    categoryItem: string;
    desc?: string;
    category: string[];
    tag: string[];
    blockquoteDesc?: string;
    singleImgOne?: string;
    singleImgTwo?: string;
    singleImgAlt?: string;
    isFeatured?: boolean;
    content: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
