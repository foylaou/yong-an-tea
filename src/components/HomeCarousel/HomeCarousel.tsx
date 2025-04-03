import {JSX, ReactNode} from 'react';

/**
 * HomeCarousel 組件參數
 *
 * @interface HomeCarouselProps
 * @property {ReactNode} children 傳入的內容，通常為 Swiper 或輪播區塊
 */
interface HomeCarouselProps {
    children: ReactNode;
}

/**
 * HomeCarousel - 輪播區外框容器
 *
 * @param {HomeCarouselProps} props 組件參數
 * @returns {JSX.Element} 輪播容器區塊
 */
export default function HomeCarousel({ children }: HomeCarouselProps): JSX.Element {
    return (
        <div className="home-carousel bg-white relative lg:mb-[515px] sm:mb-[745px]">
            {children}
        </div>
    );
}
