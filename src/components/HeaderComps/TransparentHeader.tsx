import { useEffect, useRef } from 'react';
import SearchBarComps from '../SearchBarComps';
import LogoComps from '../LogoComps';
import HeaderRight from './HeaderRightSide';

function TransparentHeader() {
    const header = useRef<HTMLElement>(null);
    useEffect(() => {
        window.addEventListener('scroll', isSticky);

        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, []);

    const isSticky = () => {
        const scrollTop = window.scrollY;

        scrollTop >= 90
            ? header.current?.classList.add('is-sticky')
            : header.current?.classList.remove('is-sticky');
    };

    return (
        <header
            ref={header}
            className="flex items-center px-[20px] h-[90px] w-full absolute top-0 z-30"
        >
            <div className="container">
                <div className="grid grid-cols-12">
                    <div className="md:col-span-4 max-lm:hidden">
                        <SearchBarComps placeholdertext="搜尋商品..." />
                    </div>
                    <div className="md:col-span-4 sm:col-span-6 col-span-4">
                        <LogoComps
                            headerLogoCName="flex md:justify-center"
                            logoPath="/"
                        />
                    </div>
                    <div className="md:col-span-4 sm:col-span-6 col-span-8 self-center">
                        <HeaderRight />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TransparentHeader;
