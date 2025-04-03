import {JSX, ReactNode} from 'react';
import ReactDom from 'react-dom';
import { IoCloseOutline } from 'react-icons/io5';

interface QuickViewProps {
    children: ReactNode;
    open: boolean;
    onClose: () => void;
}

export default function QuickView({
                                      children,
                                      open,
                                      onClose
                                  }: QuickViewProps): JSX.Element | null {
    const quickview =
        'fixed flex top-0 left-0 w-full h-[calc(100%+90px)] overflow-y-auto z-50';
    const quickviewInner =
        'relative bg-white xl:w-[1170px] w-[calc(100%-60px)] m-auto before:bg-black before:fixed before:opacity-50 before:pointer-events-none before:w-full before:h-full before:top-0 before:left-0 before:z-[-1]';

    if (!open) return null;

    return ReactDom.createPortal(
        <div className={quickview} onClick={onClose}>
            <div
                className={quickviewInner}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="quickview-top absolute top-[20px] right-[20px] z-[1]"
                    onClick={onClose}
                >
                    <IoCloseOutline className="text-[32px] cursor-pointer" />
                </div>
                {children}
            </div>
        </div>,
        document.getElementById('quickview-root') as HTMLElement
    );
}