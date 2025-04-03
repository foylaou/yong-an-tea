"use client"
import React, { useState } from 'react';
import { IoChevronForwardSharp } from 'react-icons/io5';
import { BlogListProps} from './blog-types';
import BlogListItem from "@/components/helendo/Blogs/BlogListItem";


export default function BlogList({ blogs }: BlogListProps) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemPerPage] = useState<number>(5);

    const [pageNumberLimit] = useState<number>(5);
    const [maxPageNumberLimit, setMaxPageNumberLimit] = useState<number>(5);
    const [minPageNumberLimit, setMinPageNumberLimit] = useState<number>(0);

    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        setCurrentPage(Number((event.target as HTMLSpanElement).id));
    };

    const pages: number[] = [];
    for (let i = 1; i <= Math.ceil(blogs.length / itemPerPage); i++) {
        pages.push(i);
    }

    const indexofLastItem = currentPage * itemPerPage;
    const indexOfFirstItem = indexofLastItem - itemPerPage;
    const currentItems = blogs.slice(indexOfFirstItem, indexofLastItem);

    const renderPageNumbers = pages.map((number) => {
        if (number < maxPageNumberLimit + 1 && number > minPageNumberLimit) {
            return (
                <li className="px-[5px]" key={number}>
                    <span
                        className={`${
                            currentPage === number ? 'active' : ''
                        } bg-[#f5f5f5] cursor-pointer flex items-center px-[13px] h-[34px] text-[12px] font-medium`}
                        id={number.toString()}
                        onClick={handleClick}
                    >
                        {number}
                    </span>
                </li>
            );
        }
        return null;
    });

    const handleNextbtn = () => {
        setCurrentPage(currentPage + 1);

        if (currentPage + 1 > maxPageNumberLimit) {
            setMaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit);
            setMinPageNumberLimit(minPageNumberLimit + pageNumberLimit);
        }
    };

    let pageIncrementBtn = null;
    if (pages.length > maxPageNumberLimit) {
        pageIncrementBtn = <li onClick={handleNextbtn}>&hellip;</li>;
    }

    return (
        <div className="blog border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container lg:max-w-[884px]">
                <div className="grid grid-cols-12 gap-y-[50px]">
                    {currentItems &&
                        currentItems.map((blog) => (
                            <div className="col-span-12" key={blog.id}>
                                <BlogListItem blog={blog} />
                            </div>
                        ))}
                </div>
                <ul className="pagination flex pt-[40px]">
                    {renderPageNumbers}
                    {pageIncrementBtn}
                    <li className="px-[5px]">
                        <button
                            className="bg-[#f5f5f5] cursor-pointer flex items-center px-[13px] h-[34px] text-[12px] uppercase font-medium"
                            type="button"
                            onClick={handleNextbtn}
                            disabled={currentPage === pages[pages.length - 1]}
                        >
                            Next Page
                            <span className="ml-[10px]">
                                <IoChevronForwardSharp />
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}