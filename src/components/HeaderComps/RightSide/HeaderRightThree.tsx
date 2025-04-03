import React, {JSX, useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    IoMenuOutline,
    IoBagHandleOutline,
    IoSearchOutline,
} from 'react-icons/io5';

import {HeaderItem} from "@/components/HeaderComps/MenuType";
import Cart from "@/components/Cart/Cart";
import OffcanvasComps from "@/components/HeaderComps/OffcanvasComps";
import FullscreenSearchBar from "@/components/HeaderComps/SearchBar/SearchBar";

// 定义 Redux State 的类型
interface RootState {
    cart: {
        totalQuantity: number;
    };
}

// 定义组件 Props 的接口
interface HeaderRightThreeProps {
    headerItems: HeaderItem[];
}

// 徽章常量
const badge =
    'bg-primary text-[12px] text-center absolute bottom-[-10px] right-[-10px] h-[20px] leading-[20px] rounded-[20px] px-[6px] transition-all group-hover:text-white';

export default function HeaderRightThree({ headerItems }: HeaderRightThreeProps): JSX.Element {
    // 状态管理
    const [fullscreenSearch, setFullscreenSearch] = useState(false);
    const showFullscreenSearch = () => setFullscreenSearch(!fullscreenSearch);

    const [offcanvas, setOffcanvas] = useState(false);
    const showOffcanvas = () => setOffcanvas(!offcanvas);

    const [minicart, setMiniCart] = useState(false);
    const showMiniCart = () => setMiniCart(!minicart);

    // Redux 相关
    const dispatch = useDispatch();
    const cart = useSelector((state: RootState) => state.cart);
    const cartQuantity = useSelector((state: RootState) => state.cart.totalQuantity);

    // 初始化标记
    let isInitial = true;

    useEffect(() => {
        if (isInitial) {
            isInitial = false;
        }
    }, [cart, dispatch]);

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