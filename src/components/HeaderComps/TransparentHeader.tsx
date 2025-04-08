"use client";
import React, {JSX, useEffect, useRef} from 'react';
import {HeaderItem} from "@/components/HeaderComps/MenuType";
import HeaderRight from "@/components/HeaderComps/RightSide/HeaderRight";
import LogoComps from "@/components/LogoComps/LogoComps";
import SearchBarComps from "@/components/SearchBarComps/SearchBarComps";

// 定義組件 Props 的介面
interface TransparentHeaderProps {
    headerItems: HeaderItem[];
}

export default function TransparentHeader({ headerItems }: TransparentHeaderProps): JSX.Element {
    const header = useRef<HTMLElement>(null);

    useEffect(() => {
        const isSticky = () => {
            const scrollTop = window.scrollY;

            if (header.current) {
                if (scrollTop >= 90) {
                    header.current.classList.add('is-sticky');
                } else {
                    header.current.classList.remove('is-sticky');
                }
            }
        };

        window.addEventListener('scroll', isSticky);

        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, []);

    return (
        <header
            ref={header}
            className="flex items-center px-[20px] h-[90px] w-full absolute top-0 z-40"
        >
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-12 items-center gap-y-2">
                    {/* 桌機版左側搜尋 */}
                    <div className="md:col-span-4 max-sm:hidden">
                        <SearchBarComps placeholdertext="搜尋網站內容..." />
                    </div>

                    {/* Logo 置中 */}
                    <div className="md:col-span-4 sm:col-span-6 col-span-12 flex justify-center">
                        <LogoComps
                            headerItems={headerItems}
                            headerLogoCName="flex justify-center"
                            logoPath="/"
                        />
                    </div>

                    {/* 桌機版右側功能 */}
                    <div className="md:col-span-4 max-sm:hidden flex justify-end">
                        <HeaderRight headerItems={headerItems} />
                    </div>

                    {/* 手機版及 640px-768px 功能區 */}
                    <div className="sm:hidden col-span-12 flex justify-center">
                        <div className="flex items-center">
                            <SearchBarComps
                                placeholdertext="搜尋..."
                                mobileFullScreen={true}
                                className="mr-4"
                            />
                            <HeaderRight
                                headerItems={headerItems}
                                isMobile={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}