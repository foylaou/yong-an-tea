import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import Breadcrumb from '../../components/Breadcrumb';
import BlogList from '../../components/Blogs/BlogList';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ItemsUtil';
import { getAllBlogs } from '../../lib/blogs-db';
import { isBlogEnabled } from '../../lib/blog-guard';

interface BlogListPageProps {
    headerItems: MarkdownItem[];
    blogs: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function BlogListPage({ headerItems, blogs, footerItems }: BlogListPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="部落格列表"
                item="首頁"
                itemPath="/"
                activeItem="部落格列表"
            />
            <BlogList blogs={blogs} />
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

export default BlogListPage;
