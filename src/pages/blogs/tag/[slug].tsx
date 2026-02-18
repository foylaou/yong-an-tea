import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../../types';
import BlogWithSidebar from '../../../components/Blogs/BlogWithSidebar';
import Breadcrumb from '../../../components/Breadcrumb';
import FooterComps from '../../../components/FooterComps';
import HeaderOne from '../../../components/HeaderComps';
import { getBlogsByTag, getBlogCategories, getBlogTags } from '../../../lib/blogs-db';
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

interface BlogTagPageProps {
    blogs: MarkdownItem[];
    categories: BlogCategory[];
    tags: BlogTag[];
}

function BlogTagPage({ blogs, categories, tags }: BlogTagPageProps) {
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (!(await isBlogEnabled())) {
        return { redirect: { destination: '/', permanent: false } };
    }

    const { slug } = context.params as { slug: string };
    const [blogs, categories, tags] = await Promise.all([
        getBlogsByTag(slug),
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

export default BlogTagPage;
