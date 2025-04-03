import React, {JSX, useEffect, useRef} from 'react';

import {HeaderItem} from "@/components/HeaderComps/MenuType";
import HeaderRightThree from "@/components/HeaderComps/RightSide/HeaderRightThree";
import HeaderMenu from "@/components/HeaderComps/HeaderMenu";
import LogoComps from "@/components/LogoComps/LogoComps";


// 定義組件 Props 的介面
interface HeaderFourProps {
    headerItems: HeaderItem[];
}

export default function HeaderFour({ headerItems }: HeaderFourProps): JSX.Element {
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
            className="flex items-center h-[120px] w-full md:absolute top-0 z-30"
        >
            <div className="container-fluid relative lg:px-[100px] px-[15px]">
                <div className="grid grid-cols-12">
                    <div className="lg:col-span-4 col-span-6 self-center">
                        <LogoComps
                            headerItems={headerItems}
                            headerLogoCName="flex"
                            logoPath="/home-collection"
                        />
                    </div>
                    <div className="lg:col-span-4 hidden lg:block">
                        <HeaderMenu
                            headerItems={headerItems}
                            differentPositionCName="home-collection-megamenu-holder flex justify-center"
                        />
                    </div>
                    <div className="lg:col-span-4 col-span-6 self-center">
                        <HeaderRightThree headerItems={headerItems} />
                    </div>
                </div>
            </div>
        </header>
    );
}