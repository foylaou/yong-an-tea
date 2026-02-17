import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../../types';
import BlogWithSidebar from '../../../components/Blogs/BlogWithSidebar';
import Breadcrumb from '../../../components/Breadcrumb';
import FooterComps from '../../../components/FooterComps';
import HeaderOne from '../../../components/HeaderComps';
import { getAllItems } from '../../../lib/ItemsUtil';
import { getBlogsByCategory, getBlogCategories, getBlogTags } from '../../../lib/blogs-db';
import { isBlogEnabled } from '../../../lib/blog-guard';

interface BlogCategory {
    slug: string;
    name: string;
    count: number;
}

interface BlogTag {
    slug: string;
    name: string;
}

interface BlogCategoryPageProps {
    headerItems: MarkdownItem[];
    blogs: MarkdownItem[];
    categories: BlogCategory[];
    tags: BlogTag[];
    footerItems: MarkdownItem[];
}

function BlogCategoryPage({
    headerItems,
    blogs,
    categories,
    tags,
    footerItems,
}: BlogCategoryPageProps) {
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (!(await isBlogEnabled())) {
        return { redirect: { destination: '/', permanent: false } };
    }

    const { slug } = context.params as { slug: string };
    const headerItems = getAllItems('header');
    const [blogs, categories, tags] = await Promise.all([
        getBlogsByCategory(slug),
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

export default BlogCategoryPage;
