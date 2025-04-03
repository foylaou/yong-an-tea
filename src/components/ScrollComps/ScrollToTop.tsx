import {JSX, useEffect, useState} from 'react';
import { IoArrowUpSharp } from 'react-icons/io5';
import { className } from '@/utils/className';

export function ScrollToTop(): JSX.Element {
    const [isVisable, setIsVisable] = useState<boolean>(false);

    const toggleVisibility = (): void => {
        if (window.pageYOffset > 100) {
            setIsVisable(true);
        } else {
            setIsVisable(false);
        }
    };

    const scrollToTop = (): void => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className="fixed bottom-[60px] right-[35px] z-[5]">
            <button
                type="button"
                onClick={scrollToTop}
                className={className(
                    isVisable ? 'opacity-100' : 'opacity-0 ',
                    ' flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-sm text-white bg-primary transition-all hover:bg-primary focus:outline-none'
                )}
                aria-label="Right Align"
            >
                <IoArrowUpSharp className="h-6 w-6" aria-hidden="true" />
            </button>
        </div>
    );
}

export default ScrollToTop;