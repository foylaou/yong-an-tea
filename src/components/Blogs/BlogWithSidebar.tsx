"use client"
import React, { useEffect, useState } from 'react';
import BlogSidebarComps from './BlogSidebarComps';
import BlogSidebarItem from './BlogSidebarItem';
import { Blog } from './blog-types';

export interface BlogWithSidebarProps {
    blogs: Blog[];
    categories: string[];
    tags: string[];
}

export default function BlogWithSidebar({ blogs: mainBlog, categories, tags }: BlogWithSidebarProps) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemPerPage] = useState<number>(5);

    const [pageNumberLimit] = useState<number>(5);
    const [maxPageNumberLimit, setMaxPageNumberLimit] = useState<number>(5);
    const [minPageNumberLimit, setMinPageNumberLimit] = useState<number>(0);

    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        setCurrentPage(Number((event.target as HTMLSpanElement).id));
    };

    const [blogs, setBlogs] = useState<Blog[]>([]);

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
    const handlePrevbtn = () => {
        setCurrentPage(currentPage - 1);

        if ((currentPage - 1) % maxPageNumberLimit === 0) {
            setMaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit);
            setMinPageNumberLimit(minPageNumberLimit - pageNumberLimit);
        }
    };

    let pageIncrementBtn = null;
    if (pages.length > maxPageNumberLimit) {
        pageIncrementBtn = <li onClick={handleNextbtn}>&hellip;</li>;
    }

    let pageDecrementBtn = null;
    if (minPageNumberLimit >= 1) {
        pageDecrementBtn = <li onClick={handlePrevbtn}>&hellip;</li>;
    }

    const [searchInput, setSearchInput] = useState<string>('');

    useEffect(() => {
        const filterResult = mainBlog.filter((singleBlog) =>
            singleBlog.title.match(new RegExp(searchInput, 'ig'))
        );
        setBlogs(filterResult);
    }, [mainBlog, searchInput]);

    return (
        <div className="blog border-b border-[#ededed] xl:py-[120px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container">
                <div className="grid grid-cols-12 max-md:gap-y-[50px]">
                    <div className="xl:col-span-9 lg:col-span-8 col-span-12 max-md:order-1 space-y-[50px]">
                        {currentItems &&
                            currentItems.map((blog) => (
                                <div className="col-span-12" key={blog.id}>
                                    <BlogSidebarItem blog={blog} />
                                </div>
                            ))}
                    </div>
                    <div className="xl:col-span-3 lg:col-span-4 col-span-12 max-md:order-2 lg:pl-[25px]">
                        <BlogSidebarComps
                            blogs={blogs}
                            categories={categories}
                            tags={tags}
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                        />
                    </div>
                </div>
                <ul className="pagination flex pt-[40px]">
                    <li>
                        <button
                            className={`${
                                currentPage === pages[0] ? 'hidden' : ''
                            } bg-[#f5f5f5] cursor-pointer flex items-center text-[14px] px-[13px] h-[34px]`}
                            type="button"
                            onClick={handlePrevbtn}
                            disabled={currentPage === pages[0]}
                        >
                            上一頁
                        </button>
                    </li>
                    {pageDecrementBtn}
                    {renderPageNumbers}
                    {pageIncrementBtn}
                    <li>
                        <button
                            className={`${
                                currentPage === pages[pages.length - 1]
                                    ? 'hidden'
                                    : ''
                            } bg-[#f5f5f5] cursor-pointer flex items-center text-[14px] px-[13px] h-[34px]`}
                            type="button"
                            onClick={handleNextbtn}
                            disabled={currentPage === pages[pages.length - 1]}
                        >
                            下一頁
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
