import Link from 'next/link';
import { MarkdownItem } from '../../types';

interface BlogMasonryItemProps {
    blog: MarkdownItem;
}

function BlogMasonryItem({ blog }: BlogMasonryItemProps) {
    const formattedDate = new Date(blog?.date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return (
        <div className="break-inside-avoid">
            <div className="blog-masonry-item overflow-hidden group">
                <div className="blog-img relative">
                    <Link
                        href={`/blogs/${blog.slug}`}
                        className="blog-img block"
                    >
                        <img
                            className="object-cover object-center w-full"
                            src={blog.masonry}
                            alt={blog.altImage}
                        />
                    </Link>
                </div>
                <div className="blog-content pt-[25px]">
                    <div className="blog-meta text-[14px] pb-[10px]">
                        <span className='date after:text-[#999999] after:px-[8px] after:content-["/"]'>
                            {formattedDate}
                        </span>
                        <Link
                            href="https://www.example.com/"
                            className='author font-normal hover:text-primary transition-all after:text-[#999999] after:px-[8px] after:content-["/"]'
                        >
                            {blog.author}
                        </Link>
                        <span>
                            <span className="text-[#999999] mr-[5px]">in</span>
                            <Link
                                href={`/blogs/${blog?.slug}`}
                                className="category font-normal hover:text-primary transition-all"
                            >
                                {blog?.categoryItem}
                            </Link>
                        </span>
                    </div>
                    <h2 className="text-[20px] leading-7 ">
                        <Link
                            href={`/blogs/${blog.slug}`}
                            className="relative block text-[22px] transition-all hover:text-primary"
                        >
                            {blog.title}
                        </Link>
                    </h2>
                    <div className="btn-wrap flex pt-[45px]">
                        <Link
                            href={`/blogs/${blog?.slug}`}
                            className="border border-heading text-[15px] px-[32px] h-[40px] leading-[38px] transition-all hover:bg-heading hover:text-white"
                        >
                            Read more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogMasonryItem;
