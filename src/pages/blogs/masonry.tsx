import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import BlogMasonry from '../../components/Blogs/BlogMasonry';
import FooterComps from '../../components/FooterComps';
import { getAllBlogs } from '../../lib/blogs-db';
import { isBlogEnabled } from '../../lib/blog-guard';

interface BlogMasonryPageProps {
    blogs: MarkdownItem[];
}

function BlogMasonryPage({ blogs }: BlogMasonryPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="部落格瀑布流"
                item="首頁"
                itemPath="/"
                activeItem="部落格瀑布流"
            />
            <BlogMasonry blogs={blogs} />
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

    const blogs = await getAllBlogs();

    return {
        props: {
            blogs,
        },
    };
};

export default BlogMasonryPage;
