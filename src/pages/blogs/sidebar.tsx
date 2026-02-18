import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import BlogWithSidebar from '../../components/Blogs/BlogWithSidebar';
import FooterComps from '../../components/FooterComps';
import { getAllBlogs, getBlogCategories, getBlogTags } from '../../lib/blogs-db';
import { isBlogEnabled } from '../../lib/blog-guard';

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
    blogs: MarkdownItem[];
    categories: BlogCategory[];
    tags: BlogTag[];
}

function BlogSidebarPage({
    blogs,
    categories,
    tags,
}: BlogSidebarPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
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
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    if (!(await isBlogEnabled())) {
        return { redirect: { destination: '/', permanent: false } };
    }

    const [blogs, categories, tags] = await Promise.all([
        getAllBlogs(),
        getBlogCategories(),
        getBlogTags(),
    ]);

    return {
        props: {
            blogs,
            categories,
            tags,
        },
    };
};

export default BlogSidebarPage;
