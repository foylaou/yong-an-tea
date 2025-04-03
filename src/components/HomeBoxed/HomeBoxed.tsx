import {JSX, ReactNode} from 'react';

/**
 * HomeBoxed 組件參數
 *
 * @interface HomeBoxedProps
 * @property {ReactNode} children 傳入的子元素內容
 */
interface HomeBoxedProps {
    children: ReactNode;
}

/**
 * HomeBoxed - 具有白底與寬度限制的外框容器
 *
 * @param {HomeBoxedProps} props 組件參數
 * @returns {JSX.Element} 外框內容容器
 */
export default function HomeBoxed({ children }: HomeBoxedProps): JSX.Element {
    return (
        <div className="homebox bg-[#f4f5f7]">
            <div className="homebox-inner bg-white xxl:w-[1330px] xl:w-[1140px] m-auto">
                {children}
            </div>
        </div>
    );
}
