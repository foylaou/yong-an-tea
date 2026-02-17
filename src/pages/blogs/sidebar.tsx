import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import BlogWithSidebar from '../../components/Blogs/BlogWithSidebar';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ItemsUtil';
import { getAllBlogs, getBlogCategories, getBlogTags } from '../../lib/blogs-db';

interface BlogCategory {
    slug: string;
    name: string;
    count: number;
}

interface BlogTag {
    slug: string;
    name: string;
}

interface BlogSidebarPageProps {
    headerItems: MarkdownItem[];
    blogs: MarkdownItem[];
    categories: BlogCategory[];
    tags: BlogTag[];
    footerItems: MarkdownItem[];
}

function BlogSidebarPage({
    headerItems,
    blogs,
    categories,
    tags,
    footerItems,
}: BlogSidebarPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="部落格側邊欄"
                item="首頁"
                itemPath="/"
                activeItem="部落格側邊欄"
            />
            <BlogWithSidebar
                blogs={blogs}
                categories={categories}
                tags={tags}
            />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const headerItems = getAllItems('header');
    const [blogs, categories, tags] = await Promise.all([
        getAllBlogs(),
        getBlogCategories(),
        getBlogTags(),
    ]);
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            blogs,
            categories,
            tags,
            footerItems,
        },
    };
};

export default BlogSidebarPage;
