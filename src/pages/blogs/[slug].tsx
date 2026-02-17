import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import BlogDetail from '../../components/Blogs/BlogDetails';
import FooterComps from '../../components/FooterComps';
import { getAllItems } from '../../lib/ItemsUtil';
import { getAllBlogs, getBlogBySlug } from '../../lib/blogs-db';

interface BlogDetailPageProps {
    blog: MarkdownItem;
    headerItems: MarkdownItem[];
    footerItems: MarkdownItem[];
    prevBlog: MarkdownItem;
    nextBlog: MarkdownItem;
}

function BlogDetailPage({
    blog,
    headerItems,
    footerItems,
    prevBlog,
    nextBlog,
}: BlogDetailPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <BlogDetail blog={blog} prevBlog={prevBlog} nextBlog={nextBlog} />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as { slug: string };

    const headerItems = getAllItems('header');
    const [blog, blogs] = await Promise.all([
        getBlogBySlug(slug),
        getAllBlogs(),
    ]);

    if (!blog) {
        return { notFound: true };
    }

    const currentBlogIndex = blogs.findIndex((b) => b.slug === slug);
    const nextBlog = blogs[currentBlogIndex + 1]
        ? blogs[currentBlogIndex + 1]
        : {};
    const prevBlog = blogs[currentBlogIndex - 1]
        ? blogs[currentBlogIndex - 1]
        : {};
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            blog,
            prevBlog,
            nextBlog,
            footerItems,
        },
    };
};

export default BlogDetailPage;
