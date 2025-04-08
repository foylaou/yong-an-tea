"use client";
import React, { useState } from 'react';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';
import { JSX } from "react";

interface SearchBarCompsProps {
    placeholdertext: string;
    mobileFullScreen?: boolean;
    className?: string;
}

export default function SearchBarComps({
                                           placeholdertext,
                                           mobileFullScreen = false,
                                           className = ''
                                       }: SearchBarCompsProps): JSX.Element {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    // 非手機全屏模式（桌面）
    if (!mobileFullScreen) {
        return (
            <form className={className}>
                <div className="input-field relative max-w-[270px]">
                    <input
                        type="search"
                        name="search"
                        placeholder={placeholdertext}
                        className="bg-transparent border-0 border-b border-[rgba(0,0,0,.25)] outline-none w-full p-[10px_35px_10px_0] focus-visible:border-primary"
                    />
                    <button
                        type="submit"
                        className="absolute top-1/2 -translate-y-1/2 right-0 text-2xl"
                    >
                        <IoSearchOutline />
                    </button>
                </div>
            </form>
        );
    }

    // 手機全屏模式
    return (
        <>
            {/* 搜尋按鈕 */}
            <button
                type="button"
                onClick={toggleSearch}
                className={`text-2xl hover:text-primary transition-all ${className}`}
            >
                <IoSearchOutline />
            </button>

            {/* 彈出搜尋框 */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-white/90 z-50 flex items-start justify-center">
                    <div className="relative w-full max-w-md p-4">
                        <form className="w-full">
                            <div className="input-field relative">
                                <input
                                    type="search"
                                    name="search"
                                    placeholder={placeholdertext}
                                    className="
                                        w-full
                                        p-3
                                        text-lg
                                        border-b
                                        border-black
                                        outline-none
                                        focus:border-primary
                                        pt-40
                                    "
                                />
                                <button
                                    type="submit"
                                    className="absolute top-1/2 -translate-y-1/2 right-0 text-2xl"
                                >
                                    <IoSearchOutline />
                                </button>
                            </div>
                        </form>

                        {/* 關閉按鈕 */}
                        <button
                            type="button"
                            onClick={toggleSearch}
                            className="
                                absolute
                                top-0
                                right-0
                                text-3xl
                                p-4
                                hover:text-primary
                                transition-all
                            "
                        >
                            <IoCloseOutline />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}