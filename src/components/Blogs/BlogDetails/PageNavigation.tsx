"use client";
import Link from 'next/link';
import { IoChevronBackSharp, IoChevronForwardSharp } from 'react-icons/io5';
import {Blog} from "@/components/Blogs/blog-types";




/**
 * 分頁導航元件的屬性
 *
 * @interface PageNavigationProps
 * @member {Blog} prevBlog 上一篇部落格
 * @member {Blog} nextBlog 下一篇部落格
 */
export interface PageNavigationProps {
    prevBlog: Blog;
    nextBlog: Blog;
}

/**
 * PageNavigation 元件
 * 顯示部落格文章底部的「上一頁 / 下一頁」導覽功能。
 *
 * @component
 * @param {PageNavigationProps} props 傳入前一篇與下一篇文章的資料
 * @returns {JSX.Element} 分頁導覽區塊
 */
export default function PageNavigation({ prevBlog, nextBlog }: PageNavigationProps) {
    return (
        <div className="page-navigation pt-[60px]">
            <div className="page-navigation-inner border-t border-b border-[#cacaca] py-[40px]">
                <div className="grid lm:grid-cols-2 grid-cols-1 relative text-[18px] z-[1]">
                    <div className="page-navigation-holder flex">
                        <Link
                            href={`/blogs/${prevBlog?.slug}`}
                            className={`prev flex justify-start ${
                                !prevBlog?.slug
                                    ? 'pointer-events-none opacity-60'
                                    : 'text-[#666666]'
                            }`}
                        >
                            <span className="icon flex items-center justify-center bg-[#f4f5f7] min-w-[30px] h-[70px] mr-[40px] transition-all hover:bg-primary hover:text-white">
                                <span className="flex">
                                    <IoChevronBackSharp />
                                </span>
                            </span>
                        </Link>
                        <div className="page-navigation-item flex items-center">
                            <div className="page-navigation-info">
                                <h2 className="text-[16px] font-normal max-w-[320px] text-[#666666] mb-[15px]">
                                    {prevBlog?.title}
                                </h2>
                                <Link
                                    href={`/blogs/${prevBlog?.slug}`}
                                    className={`prev text-[16px] font-normal ${
                                        !prevBlog?.slug
                                            ? 'pointer-events-none opacity-60'
                                            : 'text-[#666666]'
                                    }`}
                                >
                                    Previous
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="page-navigation-holder flex justify-end max-sm:border-t max-sm:pt-[30px] max-sm:mt-[30px]">
                        <div className="page-navigation-item flex items-center">
                            <div className="page-navigation-info">
                                <h2 className="text-[16px] font-normal max-w-[320px] text-[#666666] mb-[15px]">
                                    {nextBlog?.title}
                                </h2>
                                <Link
                                    href={`/blogs/${nextBlog?.slug}`}
                                    className={`prev text-[16px] font-normal ${
                                        !nextBlog?.slug
                                            ? 'pointer-events-none opacity-60'
                                            : 'text-[#666666]'
                                    }`}
                                >
                                    Next
                                </Link>
                            </div>
                        </div>
                        <Link
                            href={`/blogs/${nextBlog.slug}`}
                            className={`prev flex justify-end ${
                                !nextBlog?.slug
                                    ? 'pointer-events-none opacity-60'
                                    : 'text-[#666666]'
                            }`}
                        >
                            <span className="icon flex items-center justify-center bg-[#f4f5f7] min-w-[30px] h-[70px] ml-[40px] transition-all hover:bg-primary hover:text-white">
                                <span className="flex">
                                    <IoChevronForwardSharp />
                                </span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
