"use client";
import Link from 'next/link';
import { IoAddSharp } from 'react-icons/io5';

import Image from "next/image";
import {Blog} from "@/components/Blogs/blog-types";
import {JSX} from "react";


/**
 * BlogItem 元件的屬性
 *
 * @interface BlogItemProps
 * @member {Blog} blog 要顯示的部落格資料
 */
export interface BlogItemProps {
    blog: Blog;
}

/**
 * BlogItem 元件
 * 顯示單篇部落格文章的摘要卡片，包括圖片、標題、作者、日期與分類。
 *
 * @component
 * @param {BlogItemProps} props 傳入單一部落格文章的資料
 * @returns {JSX.Element} 部落格摘要卡片
 */
export default function BlogItem({ blog }: BlogItemProps): JSX.Element {
    /**
     * 格式化文章日期為「YYYY年M月D日」格式
     */
    const formattedDate = new Date(blog?.date).toLocaleDateString('zh-tw', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="blog-item overflow-hidden group">
            <div className="blog-img relative">
                <Link href={`/blogs/${blog?.slug}`} className="blog-img block">
                    <Image
                        className="object-cover object-center w-full"
                        src={`/images/blogs/${blog?.slug}/${blog?.mediumImage}`}
                        alt={blog?.altImage}
                        width={374}
                        height={243}
                    />
                </Link>
                <Link
                    href={`/blogs/${blog?.slug}`}
                    className="flex items-center font-normal leading-7 transition ease-in-out duration-500 bg-white absolute right-0 transform translate-x-full bottom-0 group-hover:translate-x-0 py-[5px] px-[14px]"
                >
                    Read more
                    <span className="ml-[5px]">
                        <IoAddSharp />
                    </span>
                </Link>
            </div>
            <div className="blog-content pt-[25px]">
                <h2 className="text-[20px] leading-7 ">
                    <Link
                        href={`/blogs/${blog?.slug}`}
                        className="relative block pb-[15px] mb-[10px] before:bg-[#cacaca] before:absolute before:left-0 before:bottom-[-3px] before:h-[1.5px] before:w-[70px]  before:transition before:ease-in-out before:duration-[800ms] after:bg-primary after:absolute after:left-0 after:bottom-[-3px] after:h-[1.5px] after:w-0 after:transform after:transition-all after:duration-500 group-hover:after:w-[70px]"
                    >
                        {blog?.title}
                    </Link>
                </h2>
                <div className="blog-meta text-[14px]">
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
                        <span className="text-[#999999] mr-[5px]">in</span>
                        <Link
                            href={`/blogs/${blog?.slug}`}
                            className="category font-normal hover:text-primary transition-all"
                        >
                            {blog?.categoryItem}
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
}
