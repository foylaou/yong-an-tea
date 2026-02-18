import { useEffect, useRef } from 'react';
import LogoComps from '../LogoComps';
import HeaderRightThree from './HeaderRightSideThree';
import HeaderMenu from './HeaderMenu';

function HeaderFour() {
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
            className="flex items-center h-[120px] w-full md:absolute top-0 z-30"
        >
            <div className="container-fluid relative lg:px-[100px] px-[15px]">
                <div className="grid grid-cols-12">
                    <div className="lg:col-span-4 col-span-6 self-center">
                        <LogoComps
                            headerLogoCName="flex"
                            logoPath="/home-collection"
                        />
                    </div>
                    <div className="lg:col-span-4 hidden lg:block">
                        <HeaderMenu
                            differentPositionCName="home-collection-megamenu-holder flex justify-center"
                        />
                    </div>
                    <div className="lg:col-span-4 col-span-6 self-center">
                        <HeaderRightThree />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default HeaderFour;
