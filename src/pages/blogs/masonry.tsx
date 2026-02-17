import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import BlogMasonry from '../../components/Blogs/BlogMasonry';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ItemsUtil';
import { getAllBlogs } from '../../lib/blogs-db';
import { isBlogEnabled } from '../../lib/blog-guard';

interface BlogMasonryPageProps {
    headerItems: MarkdownItem[];
    blogs: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function BlogMasonryPage({ headerItems, blogs, footerItems }: BlogMasonryPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
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
                footerItems={footerItems}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    if (!(await isBlogEnabled())) {
        return { redirect: { destination: '/', permanent: false } };
    }

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

export default BlogMasonryPage;
