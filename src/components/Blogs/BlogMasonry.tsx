"use client";
import { Blog } from './blog-types';
import BlogMasonryItem from "@/components/Blogs/BlogMasonryItem";

interface BlogMasonryProps {
    blogs: Blog[];
}

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