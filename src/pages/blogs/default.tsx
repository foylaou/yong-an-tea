import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import BlogDefault from '../../components/Blogs/BlogDefault';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ItemsUtil';
import { getAllBlogs } from '../../lib/blogs-db';

interface BlogDefaultPageProps {
    headerItems: MarkdownItem[];
    blogs: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function BlogDefaultPage({ headerItems, blogs, footerItems }: BlogDefaultPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
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
                footerItems={footerItems}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const headerItems = getAllItems('header');
    const blogs = await getAllBlogs();
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            blogs,
            footerItems,
        },
    };
};

export default BlogDefaultPage;
