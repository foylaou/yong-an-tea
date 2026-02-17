import { IoCloseOutline, IoFunnelOutline } from 'react-icons/io5';
import ProductSidebarComps from './ProductSidebarComps';
import { MarkdownItem } from '../../types';

interface ProductFilterDrawerProps {
    open: boolean;
    onToggle: () => void;
    productFilter: MarkdownItem[];
}

function ProductFilterDrawer({ open, onToggle, productFilter }: ProductFilterDrawerProps) {
    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 transition-opacity"
                    onClick={onToggle}
                />
            )}
            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 z-50 h-full w-[320px] max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-[20px] py-[15px]">
                    <h3 className="text-[18px] font-medium">篩選商品</h3>
                    <button
                        type="button"
                        onClick={onToggle}
                        className="text-[28px] text-gray-500 transition-all hover:text-black"
                    >
                        <IoCloseOutline />
                    </button>
                </div>
                <div className="h-[calc(100%-60px)] overflow-y-auto p-[20px]">
                    <ProductSidebarComps productFilter={productFilter} />
                </div>
            </div>
        </>
    );
}

export function FilterToggleButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-[6px] border border-[#dddddd] px-[14px] py-[7px] text-[14px] transition-all hover:border-black hover:text-black"
        >
            <IoFunnelOutline />
            篩選
        </button>
    );
}

export default ProductFilterDrawer;
