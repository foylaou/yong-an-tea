import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import BlogDefault from '../../components/Blogs/BlogDefault';
import FooterComps from '../../components/FooterComps';
import { getAllBlogs } from '../../lib/blogs-db';
import { isBlogEnabled } from '../../lib/blog-guard';

interface BlogDefaultPageProps {
    blogs: MarkdownItem[];
}

function BlogDefaultPage({ blogs }: BlogDefaultPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="部落格預設"
                item="首頁"
                itemPath="/"
                activeItem="部落格預設"
            />
            <BlogDefault blogs={blogs} />
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

export default BlogDefaultPage;
