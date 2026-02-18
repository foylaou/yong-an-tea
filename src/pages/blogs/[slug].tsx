import type { GetServerSideProps } from 'next';
import type { MarkdownItem } from '../../types';
import HeaderOne from '../../components/HeaderComps';
import BlogDetail from '../../components/Blogs/BlogDetails';
import FooterComps from '../../components/FooterComps';
import { getAllBlogs, getBlogBySlug } from '../../lib/blogs-db';
import { isBlogEnabled } from '../../lib/blog-guard';
import { getSEOByEntity, type SEOData } from '../../lib/seo-db';
import { buildArticleJsonLd } from '../../lib/seo-jsonld';
import SEOHead from '../../components/SEOHead';
import JsonLd from '../../components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

interface BlogDetailPageProps {
    blog: MarkdownItem;
    prevBlog: MarkdownItem;
    nextBlog: MarkdownItem;
    seo: SEOData | null;
}

function BlogDetailPage({
    blog,
    prevBlog,
    nextBlog,
    seo,
}: BlogDetailPageProps) {
    const articleJsonLd = buildArticleJsonLd(
        {
            title: blog.title,
            slug: blog.slug,
            date: blog.date,
            author: blog.author,
            desc_text: blog.desc,
            medium_image: blog.mediumImage,
        },
        SITE_URL
    );

    return (
        <>
            <SEOHead
                seo={seo}
                fallback={{
                    title: blog.title,
                    description: blog.desc,
                    image: blog.mediumImage,
                }}
                path={`/blogs/${blog.slug}`}
            />
            <JsonLd data={seo?.structured_data || articleJsonLd} />
            <HeaderOne headerContainer="container" />
            <BlogDetail blog={blog} prevBlog={prevBlog} nextBlog={nextBlog} />
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

    const [blog, blogs] = await Promise.all([
        getBlogBySlug(slug),
        getAllBlogs(),
    ]);

    if (!blog) {
        return { notFound: true };
    }

    const seo = await getSEOByEntity('blog', blog.uuid);

    const currentBlogIndex = blogs.findIndex((b) => b.slug === slug);
    const nextBlog = blogs[currentBlogIndex + 1]
        ? blogs[currentBlogIndex + 1]
        : {};
    const prevBlog = blogs[currentBlogIndex - 1]
        ? blogs[currentBlogIndex - 1]
        : {};

    return {
        props: {
            blog,
            prevBlog,
            nextBlog,
            seo,
        },
    };
};

export default BlogDetailPage;
