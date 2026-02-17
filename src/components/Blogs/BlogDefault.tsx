import { useState } from 'react';
import BlogItem from './BlogItem';
import { MarkdownItem } from '../../types';

interface BlogDefaultProps {
    blogs: MarkdownItem[];
}

function BlogDefault({ blogs }: BlogDefaultProps) {
    const [noOfElement, setNoOfElement] = useState(6);
    const blogSlice = blogs.slice(0, noOfElement);

    const loadMore = () => {
        setNoOfElement(noOfElement + noOfElement);
    };
    return (
        <div className="blog border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container">
                <div className="grid grid-cols-12 gap-x-[25px] gap-y-[50px]">
                    {blogSlice?.map((blog) => (
                        <div
                            className="lg:col-span-4 lm:col-span-6 col-span-12"
                            key={blog.id}
                        >
                            <BlogItem blog={blog} />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 text-center">
                    {noOfElement < blogs.length && (
                        <div className="pt-[90px]">
                            <button
                                className="bg-black text-white transition-all hover:bg-primary px-[40px] h-[40px] leading-[40px]"
                                type="button"
                                onClick={loadMore}
                            >
                                載入更多
                            </button>
                        </div>
                    )}
                    {noOfElement > blogs.length && (
                        <div className="pt-[80px]">
                            <span>所有文章已載入完畢！</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BlogDefault;
