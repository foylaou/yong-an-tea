import Link from 'next/link';
import { IoArrowBackSharp, IoCartOutline } from 'react-icons/io5';

function EmptyCart() {
    return (
        <div className="empty-cart flex flex-col items-center">
            <span className="icon text-[170px]">
                <IoCartOutline />
            </span>
            <p className="text-[20px]">您的購物車目前是空的。</p>
            <div className="btn-wrap pt-[25px]">
                <Link
                    href="/products/left-sidebar"
                    className="inline-flex items-center bg-black text-white h-[46px] px-[42px] transition-all hover:bg-[#222222]"
                >
                    <IoArrowBackSharp className="mr-[5px]" />
                    繼續購物
                </Link>
            </div>
        </div>
    );
}

export default EmptyCart;
