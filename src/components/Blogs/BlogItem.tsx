import Link from 'next/link';
import { IoAddSharp } from 'react-icons/io5';
import { MarkdownItem } from '../../types';

interface BlogItemProps {
    blog: MarkdownItem;
}

function BlogItem({ blog }: BlogItemProps) {
    const formattedDate = new Date(blog?.date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return (
        <div className="blog-item overflow-hidden group">
            <div className="blog-img relative">
                <Link href={`/blogs/${blog?.slug}`} className="blog-img block">
                    <img
                        className="object-cover object-center w-full"
                        src={blog?.mediumImage}
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
                    <IoAddSharp className="ml-[5px]" />
                </Link>
            </div>
            <div className="blog-content pt-[25px]">
                <h2 className="text-[20px] leading-7 ">
                    <Link
                        href={`/blogs/${blog?.slug}`}
                        className="relative block pb-[15px] mb-[10px] before:bg-[#cacaca] before:absolute before:left-0 before:bottom-[-3px] before:h-[1.5px] before:w-[70px]  before:transition before:ease-in-out before:duration-800 after:bg-primary after:absolute after:left-0 after:bottom-[-3px] after:h-[1.5px] after:w-0 after:transform after:transition-all after:duration-500 group-hover:after:w-[70px]"
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

export default BlogItem;
