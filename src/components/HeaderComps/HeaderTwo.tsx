import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { IoCallOutline } from 'react-icons/io5';
import {HeaderItem} from "@/components/HeaderComps/MenuType";
import HeaderMenu from "@/components/HeaderComps/HeaderMenu";
import HeaderRightTwo from "@/components/HeaderComps/RightSide/HeaderRightSideTwo";
import LogoComps from "@/components/LogoComps/LogoComps";



// 定義組件 Props 的介面
interface HeaderTwoProps {
    headerItems: HeaderItem[];
}

export default function HeaderTwo({ headerItems }: HeaderTwoProps): JSX.Element {
    // 使用泛型指定 ref 的類型
    const header = useRef<HTMLDivElement>(null);

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
        <header>
            <div className="header-top hidden md:block">
                <div className="homebox-container border-b border-[#dddddd] py-[50px] xl:mx-[100px] mx-[50px]">
                    <LogoComps
                        headerItems={headerItems}
                        logoPath="/home-boxed"
                        headerLogoCName="flex justify-center"
                    />
                </div>
            </div>
            <div className="homebox-header top-0 z-30" ref={header}>
                <div className="homebox-container relative xl:mx-[100px] sm:mx-[50px] mx-[15px] pt-[25px] lg:pt-0 pb-[15px] lg:pb-0">
                    <div className="grid grid-cols-12 self-center">
                        <div className="lg:col-span-4 md:col-span-6 self-center hidden md:block">
                            <div className="header-contact">
                                {headerItems[0]?.headerNumberInfo?.map(
                                    (item) => (
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
                                    )
                                )}
                            </div>
                            <LogoComps
                                headerItems={headerItems}
                                logoPath="/home-boxed"
                                headerLogoCName="sticky-logo"
                            />
                        </div>
                        <div className="lg:col-span-4 hidden lg:block">
                            <HeaderMenu
                                headerItems={headerItems}
                                differentPositionCName=""
                            />
                        </div>
                        <div className="lg:col-span-4 md:col-span-6 col-span-12 self-center">
                            <HeaderRightTwo headerItems={headerItems} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}