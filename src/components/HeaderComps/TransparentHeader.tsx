import { useEffect, useRef, useState } from 'react';
import SearchBarComps from '../SearchBarComps';
import LogoComps from '../LogoComps';
import HeaderRight from './HeaderRightSide';
import { useSettingsStore } from '../../store/settings/settings-slice';

function TransparentHeader() {
    const header = useRef<HTMLElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const hideAtTop = useSettingsStore((s) => s.hero_hide_header_at_top) === 'true';

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const sticky = scrollTop >= 90;

            if (sticky) {
                header.current?.classList.add('is-sticky');
            } else {
                header.current?.classList.remove('is-sticky');
            }

            setIsScrolled(sticky);
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const hidden = hideAtTop && !isScrolled;

    return (
        <header
            ref={header}
            className={`flex items-center px-[20px] h-[90px] w-full absolute top-0 z-30 transition-opacity duration-300 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
