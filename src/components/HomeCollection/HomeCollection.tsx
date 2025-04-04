"use client";
import {JSX, ReactNode} from 'react';

/**
 * HomeCollection 組件參數
 *
 * @interface HomeCollectionProps
 * @property {ReactNode} children 傳入的子元素內容，可為單一或多個元素
 */
interface HomeCollectionProps {
    children: ReactNode;
}

/**
 * HomeCollection - 收藏展示區塊容器
 *
 * @param {HomeCollectionProps} props 組件參數
 * @returns {JSX.Element} 收藏展示區塊
 */
export default function HomeCollection({ children }: HomeCollectionProps): JSX.Element {
    return (
        <div className="home-collection bg-white relative lg:mb-[515px] sm:mb-[745px]">
            {children}
        </div>
    );
}
