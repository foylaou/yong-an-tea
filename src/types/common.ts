export interface HeroItem {
    id: string;
    heroBG: string;
    subtitle: string;
    title: string;
    desc: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface FeaturedProductData {
    id: string;
    subTitle: string;
    title: string;
    excerpt: string;
    image: string;
    altImage: string;
    path: string;
    buttonText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface MarkdownItem {
    slug?: string;
    content?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
