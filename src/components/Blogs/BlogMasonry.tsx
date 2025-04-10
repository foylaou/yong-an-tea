"use client";
import { Blog } from './blog-types';
import BlogMasonryItem from "@/components/Blogs/BlogMasonryItem";

/**
 * BlogMasonry 元件屬性
 * 用於傳入部落格資料陣列以生成瀑布流樣式的文章排版。
 *
 * @interface BlogMasonryProps
 * @member {Blog[]} blogs 要顯示的部落格文章陣列
 */
export interface BlogMasonryProps {
    blogs: Blog[];
}

/**
 * BlogMasonry 元件
 * 顯示部落格文章於瀑布流樣式排版的區塊中。
 *
 * @component
 * @param {BlogMasonryProps} props 包含部落格文章陣列的屬性
 * @returns {JSX.Element} 瀑布流部落格文章排版
 */
export default function BlogMasonry({ blogs }: BlogMasonryProps) {
    return (
        <div className="blog border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container">
                <div className="lg:columns-3 lm:columns-2 columns-1 xl:w-[1145px] mx-auto gap-x-[25px] space-y-[40px]">
                    {blogs?.map((blog) => (
                        <BlogMasonryItem blog={blog} key={blog.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
