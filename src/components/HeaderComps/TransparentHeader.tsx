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
    // 修正：使用 HTMLElement 或 HTMLHeaderElement 作為 ref 類型
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
            className="flex items-center px-[20px] h-[90px] w-full absolute top-0 z-30"
        >
            <div className="container">
                <div className="grid grid-cols-12">
                    <div className="md:col-span-4 max-lm:hidden">
                        <SearchBarComps placeholdertext="Search Anything..." />
                    </div>
                    <div className="md:col-span-4 sm:col-span-6 col-span-4">
                        <LogoComps
                            headerItems={headerItems}
                            headerLogoCName="flex md:justify-center"
                            logoPath="/"
                        />
                    </div>
                    <div className="md:col-span-4 sm:col-span-6 col-span-8 self-center">
                        <HeaderRight headerItems={headerItems} />
                    </div>
                </div>
            </div>
        </header>
    );
}
