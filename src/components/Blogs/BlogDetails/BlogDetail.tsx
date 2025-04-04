"use client";
import Link from 'next/link';
import { FaQuoteRight } from 'react-icons/fa';
import {BlogDetailProps} from "@/components/Blogs/blog-types";
import PageNavigation from "@/components/Blogs/BlogDetails/PageNavigation";
import DisqusForm from "@/components/DisqusForm/DisqusForm";

import Image from "next/image";


export default function BlogDetail({ blog, prevBlog, nextBlog }: BlogDetailProps) {
    const formattedDate = new Date(blog?.date).toLocaleDateString('zh-tw', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return (
        <div className="blog-detail border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container">
                <div className="blog-detail-item">
                    <div className="blog-detail-img">
                        <Image
                            className="object-cover object-center w-full"
                            src={`/images/blogs/${blog?.slug}/${blog?.extraLargeImage}`}
                            alt={blog?.altImage}
                            width={1170}
                            height={761}
                        />
                    </div>
                    <div className="blog-detail-content pt-[25px]">
                        <h2 className="lm:text-[30px] text-[24px] mb-[15px]">
                            {blog?.title}
                        </h2>
                        <div className="inner-content lg:ml-[145px]">
                            <div className="blog-meta text-[14px] mb-[15px]">
                                <span className='date after:text-[#999999] after:px-[8px] after:content-["/"]'>
                                    {formattedDate}
                                </span>
                                <Link
                                    href="https://www.example.com/"
                                    className='author font-normal hover:text-primary transition-all after:text-[#999999] after:px-[8px] after:content-["/"]'
                                >
                                    {blog?.author}
                                </Link>
                                <span>
                                    <span className="text-[#999999] mr-[5px]">
                                        in
                                    </span>
                                    <span className="category font-norma">
                                        {blog?.categoryItem}
                                    </span>
                                </span>
                            </div>
                            <p className="lg:max-w-[810px]">{blog?.desc}</p>
                            <blockquote className="relative pt-[4px] pl-[35px] my-[35px] ml-[35px]">
                                <span className="absolute top-0 left-0 transform -rotate-[180deg]">
                                    <FaQuoteRight />
                                </span>
                                <p className="blockquote-desc font-medium leading-6">
                                    {blog?.blockquoteDesc}
                                </p>
                            </blockquote>
                        </div>
                        <div className="rich-text-item">
                            <div className="rich-text-img grid grid-cols-2 gap-[30px]">
                                <div className="single-img">
                                    <Image
                                        className="w-full"
                                        src={blog?.singleImgOne}
                                        alt={blog?.singleImgAlt}
                                    />
                                </div>
                                <div className="single-img">
                                    <Image
                                        className="w-full"
                                        src={blog?.singleImgTwo}
                                        alt={blog?.singleImgAlt}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <PageNavigation prevBlog={prevBlog} nextBlog={nextBlog} />
                <DisqusForm />
            </div>
        </div>
    );
}