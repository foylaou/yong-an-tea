import BlogItem from '../Blogs/BlogItem';
import {Blog} from "@/components/Blogs/blog-types";
import {JSX} from "react";


/**
 * LatestBlog 組件參數
 *
 * @interface LatestBlogProps
 * @property {string} sectionTitle 區塊標題文字
 * @property {Blog[]} blogs Blog 陣列資料
 */
interface LatestBlogProps {
    sectionTitle: string;
    blogs: Blog[];
}

/**
 * LatestBlog - 最新部落格展示區塊（置中標題）
 *
 * @param {LatestBlogProps} props 組件參數
 * @returns {JSX.Element} 部落格展示元件
 */
export default function LatestBlog({
                                       sectionTitle,
                                       blogs,
                                   }: LatestBlogProps): JSX.Element {
    const slice = blogs.slice(0, 3);

    return (
        <div className="latest-blog lg:py-[90px] md:py-[70px] py-[40px]">
            <div className="container">
                <div className="section-title text-center pb-[10px] mb-[50px] relative after:bg-primary after:absolute after:left-1/2 after:transform after:-translate-x-1/2 after:bottom-0 after:h-[4px] after:w-[70px]">
                    <h2>{sectionTitle}</h2>
                </div>
                <div className="grid lg:grid-cols-3 lm:grid-cols-2 gap-[25px]">
                    {slice.map((blog) => (
                        <BlogItem blog={blog} key={blog.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
