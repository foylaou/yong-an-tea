// blog-types.ts - 共享類型定義
export interface Blog {
    id: string | number;
    slug: string;
    mediumImage: string;
    largeImage: string; // 新增
    altImage: string;
    title: string;
    date: string;
    author: string;
    categoryItem: string;
    desc: string; // 新增
    masonry: string; // 新增
    extraLargeImage: string;
    blockquoteDesc: string;
    singleImgOne: string;
    singleImgTwo: string;
    singleImgAlt: string;
}

export interface BlogItemProps {
    blog: Blog;
}

export interface BlogDefaultProps {
    blogs: Blog[];
}

export interface BlogListProps {
    blogs: Blog[];
}
export interface BlogDetailProps {
    blog: Blog;
    prevBlog: Blog;
    nextBlog: Blog;
}
export interface PageNavigationProps {
    prevBlog: Blog;
    nextBlog: Blog;
}