"use client";
import React, {JSX, useEffect, useRef} from 'react';
import Link from 'next/link';
import { IoCallOutline } from 'react-icons/io5';
import {HeaderItem} from "@/components/HeaderComps/MenuType";
import HeaderRightTwo from "@/components/HeaderComps/RightSide/HeaderRightSideTwo";
import LogoComps from "@/components/LogoComps/LogoComps";



// 定義組件 Props 的介面
interface HeaderThreeProps {
    headerItems: HeaderItem[];
    logoPath: string;
}
export default function HeaderThree({
                                        headerItems,
                                        logoPath
                                    }: HeaderThreeProps): JSX.Element {
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
            <div className="container-fluid md:px-[100px] px-[15px]">
                <div className="grid grid-cols-12">
                    <div className="md:col-span-4 self-center hidden md:block">
                        <div className="header-contact">
                            {headerItems[0]?.headerNumberInfo?.map((item) => (
                                <Link
                                    href={item.numberUrl}
                                    key={item.id}
                                    className="flex transition-all hover:text-primary"
                                >
                                    <IoCallOutline className="text-[18px] mr-[5px]" />
                                    <span className="font-normal">
                                        {item.numberInText}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-4 hidden md:block">

                        <LogoComps
                            headerItems={headerItems}
                            logoPath={logoPath}
                            headerLogoCName="flex justify-center"
                        />
                    </div>
                    <div className="md:col-span-4 col-span-12 self-center">
                        <HeaderRightTwo headerItems={headerItems} />
                    </div>
                </div>
            </div>
        </header>
    );
}