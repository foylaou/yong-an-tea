import { useEffect, useState } from 'react';
import {
    IoMenuOutline,
    IoBagHandleOutline,
    IoSearchOutline,
} from 'react-icons/io5';

import { useCartStore } from '../../store/cart/cart-slice';
import Cart from '../Cart';
import OffcanvasComps from './OffcanvasComps';
import FullscreenSearchBar from './FullscreenSearchBar';
import type { MarkdownItem } from '../../types';

let isInitial = true;

const badge =
    'bg-primary text-[12px] text-center absolute bottom-[-10px] right-[-10px] h-[20px] leading-[20px] rounded-[20px] px-[6px] transition-all group-hover:text-white';

interface HeaderRightThreeProps {
    headerItems: MarkdownItem[];
}

function HeaderRightThree({ headerItems }: HeaderRightThreeProps) {
    const [fullscreenSearch, setFullscreenSearch] = useState(false);
    const showFullscreenSearch = () => setFullscreenSearch(!fullscreenSearch);

    const [offcanvas, setOffcanvas] = useState(false);
    const showOffcanvas = () => setOffcanvas(!offcanvas);

    const [minicart, setMiniCart] = useState(false);
    const showMiniCart = () => setMiniCart(!minicart);

    const cart = useCartStore();
    const cartQuantity = useCartStore((state) => state.totalQuantity);

    useEffect(() => {
        if (isInitial) {
            isInitial = false;
        }
    }, [cart]);

    return (
        <>
            <div className="flex justify-end">
                <div className="search-item mr-[35px]">
                    <button
                        type="button"
                        className="text-2xl"
                        onClick={showFullscreenSearch}
                    >
                        <IoSearchOutline />
                    </button>
                </div>
                <div className="minicart-item mr-[35px]">
                    <button
                        type="button"
                        className="text-2xl relative group hover:text-primary transition-all"
                        onClick={showMiniCart}
                    >
                        <IoBagHandleOutline />
                        <span className={badge}>{cartQuantity}</span>
                    </button>
                </div>
                <div className="menu-item">
                    <button
                        type="button"
                        className="text-2xl hover:text-primary transition-all"
                        onClick={showOffcanvas}
                    >
                        <IoMenuOutline />
                    </button>
                </div>
            </div>

            <OffcanvasComps
                headerItems={headerItems}
                offcanvas={offcanvas}
                showOffcanvas={showOffcanvas}
            />
            <FullscreenSearchBar
                headerItems={headerItems}
                fullscreenSearch={fullscreenSearch}
                showFullscreenSearch={showFullscreenSearch}
            />
            <Cart minicart={minicart} showMiniCart={showMiniCart} />
        </>
    );
}

export default HeaderRightThree;
