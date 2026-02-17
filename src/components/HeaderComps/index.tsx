import { useEffect, useRef } from 'react';
import SearchBarComps from '../SearchBarComps';
import LogoComps from '../LogoComps';
import HeaderRight from './HeaderRightSide';
import type { MarkdownItem } from '../../types';

interface HeaderOneProps {
    headerItems: MarkdownItem[];
    headerContainer?: string;
}

function HeaderOne({ headerItems, headerContainer }: HeaderOneProps) {
    // Header Sticky Activation
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
    //   End Here

    return (
        <header
            ref={header}
            className="flex items-center w-full h-[90px] top-0 z-30"
        >
            <div className={headerContainer}>
                <div className="grid grid-cols-12">
                    <div className="col-span-4 hidden lm:block">
                        <SearchBarComps placeholdertext="搜尋商品..." />
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

export default HeaderOne;
