import Link from 'next/link';
import { IoCloseOutline } from 'react-icons/io5';
import { useWishlistStore } from '../../store/wishlist/wishlist-slice';
import { formatPrice, useSettingsStore } from '../../store/settings/settings-slice';
import EmptyWishlist from './EmptyWishlist';

function parseJSON<T>(raw: string | undefined, fallback: T): T {
    try {
        if (raw) return JSON.parse(raw);
        return fallback;
    } catch {
        return fallback;
    }
}

function WishlistPageComps() {
    const settings = useSettingsStore();
    const wishlistThList = parseJSON<any[]>(settings.wishlist_th_list_json, []);

    const initialValue = 0;

    const wishlistItems = useWishlistStore((state) => state.items);

    const removeItemFromWishlistHandler = (id: string) => {
        useWishlistStore.getState().removeItemFromWishlist(id);
    };

    const clearAllItemHandler = () => {
        useWishlistStore.getState().clearAllFromWishlist();
    };

    return (
        <div className="wishlist border-b border-[#ededed] lg:pt-[80px] md:py-[60px] py-[30px] lg:pb-[100px] md:pb-[80px] pb-[50px]">
            <div className="container">
                {wishlistItems.length <= 0 && <EmptyWishlist />}
                {wishlistItems.length <= 0 ||
                    (initialValue === 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="wishlist-table bg-[#f4f5f7] w-full text-sm text-left">
                                    <thead className="text-[18px]">
                                        <tr>
                                            {wishlistThList.map(
                                                (singleWishlistTh: any) => (
                                                    <th
                                                        key={
                                                            singleWishlistTh.id
                                                        }
                                                        scope="col"
                                                        className={`${singleWishlistTh.thCName} first:pl-[100px]`}
                                                    >
                                                        {
                                                            singleWishlistTh.thName
                                                        }
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    {wishlistItems.map((item) => (
                                        <tbody key={item.id}>
                                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="py-[30px] pr-[25px] flex items-center font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                    <Link
                                                        href={item.slug}
                                                        className="product-img w-[100px]"
                                                    >
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                        />
                                                    </Link>
                                                    <h2 className="product-name">
                                                        <Link
                                                            href={item.slug}
                                                            className="text-[14px] transition-all hover:text-primary"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </h2>
                                                </td>
                                                <td className="py-[30px]">
                                                    {formatPrice(item.price)}
                                                </td>
                                                <td className="py-[30px]">
                                                    <Link
                                                        href="https://www.amazon.com"
                                                        className="inline-flex items-center bg-black text-white h-[46px] sm:px-[42px] px-[12px] transition-all hover:bg-[#222222]"
                                                    >
                                                        立即購買
                                                    </Link>
                                                </td>
                                                <td className="py-[30px] text-right">
                                                    <button
                                                        type="button"
                                                        className="item-remove"
                                                        onClick={() =>
                                                            removeItemFromWishlistHandler(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        <IoCloseOutline className="text-[24px] transition-all hover:text-red-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    ))}
                                </table>
                            </div>
                            <div className="group-btn flex justify-end pt-[30px]">
                                <div className="btn-wrap">
                                    <button
                                        onClick={clearAllItemHandler}
                                        type="button"
                                        className="inline-flex items-center border border-black h-[46px] sm:px-[42px] px-[12px] transition-all hover:bg-[#222222] hover:text-white"
                                    >
                                        {settings.wishlist_clear_btn_text}
                                    </button>
                                </div>
                            </div>
                        </>
                    ))}
            </div>
        </div>
    );
}

export default WishlistPageComps;
