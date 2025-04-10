"use client";
import Link from 'next/link';

import Image from "next/image";
import {Blog} from "@/components/Blogs/blog-types";

/**
 * BlogItem 元件的屬性
 *
 * @interface BlogItemProps
 * @member {Blog} blog 要顯示的部落格資料
 */
export interface BlogItemProps {
    blog: Blog;
}
export default function BlogMasonryItem({ blog }: BlogItemProps) {
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
                        <Image
                            className="object-cover object-center w-full"
                            src={`/images/blogs/${blog.slug}/${blog.masonry}`}
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
                            href={blog.authorInfo}
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
