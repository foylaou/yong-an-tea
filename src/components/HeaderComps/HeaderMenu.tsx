"use client";
import React, {JSX} from 'react';
import Link from 'next/link';
import {ExtendedMenuItem, HeaderItem} from "@/components/HeaderComps/MenuType";

// 定義組件 Props 的介面
interface HeaderMenuProps {
    headerItems: HeaderItem[];
    differentPositionCName: string;
}


export default function HeaderMenu({
                                       headerItems,
                                       differentPositionCName
                                   }: HeaderMenuProps): JSX.Element {
    return (
        <div className={`${differentPositionCName} header-menu`}>
            <nav>
                <ul className="flex justify-center">
                    {headerItems[0]?.homeBoxedMenu?.map((menuOne: ExtendedMenuItem) => (
                        <li
                            className={`${menuOne.holderCName} py-[50px] mr-[55px] last:mr-0`}
                            key={menuOne.id}
                        >
                            <Link href={menuOne.path || '#'}>{menuOne.title}</Link>
                            {menuOne.submenuCName && !menuOne.megamenuCName && (
                                <ul className={`${menuOne.submenuCName}`}>
                                    {menuOne?.headerSubmenu?.map(
                                        (submenuOne) => (
                                            <li key={submenuOne.id}>
                                                <Link
                                                    href={`${submenuOne.submenuPath}`}
                                                >
                                                    {submenuOne.submenuTitle}
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                            {menuOne.megamenuCName && !menuOne.submenuCName && (
                                <ul className={`${menuOne.megamenuCName} flex`}>
                                    {menuOne?.headerMegamenu?.map(
                                        (megamenuOne) => (
                                            <li
                                                className="basis-[22%] px-[15px]"
                                                key={megamenuOne.id}
                                            >
                                                <span className="font-medium block mb-[20px]">
                                                    {megamenuOne.groupName}
                                                </span>
                                                <ul>
                                                    {megamenuOne?.groupItems?.map(
                                                        (groupItem) => (
                                                            <li
                                                                className="mb-[10px] last:mb-0"
                                                                key={
                                                                    groupItem.id
                                                                }
                                                            >
                                                                <Link
                                                                    href={`${groupItem.megamenuPath}`}
                                                                    className="font-normal transition-all hover:text-primary"
                                                                >
                                                                    {
                                                                        groupItem.megamenuTitle
                                                                    }
                                                                </Link>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}