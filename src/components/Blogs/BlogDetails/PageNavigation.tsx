import Link from 'next/link';
import { IoChevronBackSharp, IoChevronForwardSharp } from 'react-icons/io5';
import { MarkdownItem } from '../../../types';

interface PageNavigationProps {
    prevBlog: MarkdownItem;
    nextBlog: MarkdownItem;
}

function PageNavigation({ prevBlog, nextBlog }: PageNavigationProps) {
    return (
        <div className="page-navigation pt-[60px]">
            <div className="page-navigation-inner border-t border-b border-[#cacaca] py-[40px]">
                <div className="grid lm:grid-cols-2 grid-cols-1 relative text-[18px] z-1">
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
                                <IoChevronBackSharp />
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
                                    上一篇
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
                                    下一篇
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
                                <IoChevronForwardSharp />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageNavigation;
