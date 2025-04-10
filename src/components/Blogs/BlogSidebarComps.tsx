
import Link from 'next/link';
import BlogSearchBar from './BlogSearchBar';
import { Blog } from './blog-types';
import Image from "next/image";

export interface BlogSidebarCompsProps {
    blogs: Blog[];
    categories: string[];
    tags: string[];
    searchInput: string;
    setSearchInput: (value: string) => void;
}

export default function BlogSidebarComps({
                                             blogs,
                                             categories,
                                             tags,
                                             searchInput,
                                             setSearchInput,
                                         }: BlogSidebarCompsProps) {

    return (
        <div className="blog-sidebar">
            <div className="blog-sidebar-widget">
                <BlogSearchBar
                    value={searchInput}
                    changeInput={(e) => setSearchInput(e.target.value)}
                />
            </div>
            <div className="blog-sidebar-widget">
                <h2 className="widget-title text-[18px] mt-[40px]">
                    Recent Posts
                </h2>
                <ul className="pt-[15px]">
                    {blogs.slice(-3).map((recentBlog) => (
                        <li
                            key={recentBlog.id}
                            className="flex border-b border-[#dddddd] pb-[10px] mb-[10px] last:border-b-0 last:pb-0 last:mb-0"
                        >
                            <Link
                                href={`/blogs/${recentBlog?.slug}`}
                                className="text-[14px] leading-[24px] font-normal"
                            >
                                {recentBlog?.title}
                                <span className="text-[#999999] ml-[5px]">
                                    {recentBlog?.date}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="blog-sidebar-widget">
                <h2 className="widget-title text-[18px] mt-[40px]">
                    分類
                </h2>
                <ul className="pt-[15px]">
                    {categories &&
                        categories?.map((category) => (
                            <li className="mb-[6px] last:mb-0" key={category}>
                                <Link
                                    href={`/blogs/category/${category
                                        .split('|')[0]
                                        .trim()}`}
                                    className="flex justify-between capitalize font-normal leading-[28px] transition-all hover:text-primary"
                                    dangerouslySetInnerHTML={{
                                        __html: category.replace('|', ''),
                                    }}
                                />
                            </li>
                        ))}
                </ul>
            </div>
            <div className="blog-sidebar-widget pt-[40px]">
                <Image
                    src="/images/blog-sidebar/widget-banner.jpg"
                    alt="Widget Banner"
                />
            </div>
            <div className="blog-sidebar-widget">
                <h2 className="widget-title text-[18px] mt-[40px]">標籤</h2>
                <ul className="flex flex-wrap pt-[15px]">
                    {tags &&
                        tags?.map((tag) => (
                            <li key={tag}>
                                <Link
                                    href={`/blogs/tag/${tag}`}
                                    className="bg-[#f3f4f7] rounded-[5px] transition-all duration-500 text-[#767676] capitalize font-normal m-[5px] py-[8px] px-[20px] inline-block align-middle hover:bg-black hover:text-white"
                                >
                                    {tag}
                                </Link>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}
