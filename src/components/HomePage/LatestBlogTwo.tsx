"use client";
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';
import BlogItem from '../Blogs/BlogItem';
import {Blog} from "@/components/Blogs/blog-types";
import {JSX} from "react";



/**
 * LatestBlogTwo 組件的參數
 *
 * @interface LatestBlogTwoProps
 * @property {string} sectionTitle 區塊標題
 * @property {Blog[]} blogs Blog 資料陣列
 * @property {string} btnPath 查看更多按鈕的連結
 * @property {string} btnText 查看更多按鈕的文字
 */
interface LatestBlogTwoProps {
    sectionTitle: string;
    blogs: Blog[];
    btnPath: string;
    btnText: string;
}

/**
 * LatestBlogTwo - 最新部落格區塊（3 欄）
 *
 * @param {LatestBlogTwoProps} props 組件參數
 * @returns {JSX.Element} 部落格顯示區塊
 */
export default function LatestBlogTwo({
                                          sectionTitle,
                                          blogs,
                                          btnPath,
                                          btnText,
                                      }: LatestBlogTwoProps): JSX.Element {
    const slice = blogs.slice(0, 3);

    return (
        <div className="latest-blog lg:py-[90px] md:py-[70px] py-[40px]">
            <div className="container">
                <div className="section-title flex items-center justify-between pb-[50px]">
                    <h2>{sectionTitle}</h2>
                    <div className="view-all">
                        <Link
                            href={btnPath}
                            className="flex items-center transition-all hover:text-primary"
                        >
                            {btnText}
                            <IoArrowForwardOutline className="ml-[5px]" />
                        </Link>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 lm:grid-cols-2 gap-[25px]">
                    {slice.map((blog) => (
                        <BlogItem blog={blog} key={blog.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
