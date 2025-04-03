import React, {JSX, useEffect, useState} from 'react';
import Link from 'next/link';

import {
    IoMenuOutline,
    IoBagHandleOutline,
    IoHeartOutline,
    IoSearchOutline,
} from 'react-icons/io5';
import {HeaderItem} from "@/components/HeaderComps/MenuType";
import Cart from "@/components/Cart/Cart";
import OffcanvasComps from "@/components/HeaderComps/OffcanvasComps";
import FullscreenSearchBar from "@/components/HeaderComps/SearchBar/SearchBar";

// 定義 Redux State 的類型
interface RootState {
    cart: {
        totalQuantity: number;
    };
}



// 定義組件 Props 的介面
interface HeaderRightTwoProps {
    headerItems: HeaderItem[];
}

// 定義徽章常量
const badge =
    'bg-primary text-[12px] text-center absolute bottom-[-10px] right-[-10px] h-[20px] leading-[20px] rounded-[20px] px-[6px] transition-all group-hover:text-white';

export default function HeaderRightTwo({ headerItems }: HeaderRightTwoProps): JSX.Element {
    // 狀態管理
    const [offcanvas, setOffcanvas] = useState(false);
    const showOffcanvas = () => setOffcanvas(!offcanvas);

    const [fullscreenSearch, setFullscreenSearch] = useState(false);
    const showFullscreenSearch = () => setFullscreenSearch(!fullscreenSearch);

    const [minicart, setMiniCart] = useState(false);
    const showMiniCart = () => setMiniCart(!minicart);

    // Redux 相關
    const dispatch = useDispatch();
    const cartQuantity = useSelector((state: RootState) => state.cart.totalQuantity);

    // 初始化標記
    let isInitial = true;

    useEffect(() => {
        if (isInitial) {
            isInitial = false;
        }
    }, [dispatch]);

    return (
        <>
            <div className="header-right-wrap max-lm:grid max-lm:grid-cols-12">
                <div className="col-span-4">
                    <LogoComps
                        headerItems={headerItems}
                        logoPath="/home-boxed"
                        headerLogoCName="flex justify-start md:hidden"
                    />
                </div>
                <div className="col-span-8">
                    <div className="flex justify-end">
                        <div className="search-item md:mr-[35px] mr-[20px]">
                            <button
                                type="button"
                                className="text-2xl"
                                onClick={showFullscreenSearch}
                            >
                                <IoSearchOutline />
                            </button>
                        </div>
                        <div className="wishlist-item md:mr-[35px] sm:mr-[25px] mr-[15px]">
                            <Link
                                href="/wishlist"
                                className="text-2xl relative group hover:text-primary transition-all"
                            >
                                <IoHeartOutline />
                                <span className={badge}>0</span>
                            </Link>
                        </div>
                        <div className="minicart-item md:mr-[35px] mr-[20px]">
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