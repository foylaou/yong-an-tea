import React, {JSX, useEffect, useRef} from 'react';

import {HeaderItem} from "@/components/HeaderComps/MenuType";
import HeaderRight from "@/components/HeaderComps/RightSide/HeaderRight";
import LogoComps from "@/components/LogoComps/LogoComps";



// 定義組件 Props 的介面
interface HeaderOneProps {
    headerItems: HeaderItem[];
    headerContainer?: string;
}

export default function HeaderOne({
                                      headerItems,
                                      headerContainer = 'container'
                                  }: HeaderOneProps): JSX.Element {
    // 使用泛型指定 ref 的類型
    const header = useRef<HTMLHeadElement>(null);

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
            className="flex items-center w-full h-[90px] top-0 z-30"
        >
            <div className={headerContainer}>
                <div className="grid grid-cols-12">
                    <div className="col-span-4 hidden lm:block">
                        <SearchBarComps placeholdertext="Search Anything..." />
                    </div>
                    <div className="lm:col-span-4 col-span-6">
                        <LogoComps
                            headerItems={headerItems}
                            headerLogoCName="flex lm:justify-center"
                            logoPath="/"
                        />
                    </div>
                    <div className="lm:col-span-4 col-span-6 self-center">
                        <HeaderRight headerItems={headerItems} />
                    </div>
                </div>
            </div>
        </header>
    );
}