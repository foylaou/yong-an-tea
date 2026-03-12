import Link from 'next/link';
import { IoCloseOutline } from 'react-icons/io5';
import { useCartStore } from '../../store/cart/cart-slice';
import { formatPrice } from '../../store/settings/settings-slice';

interface CartItemData {
    id: string;
    title: string;
    quantity: number;
    price: number;
    slug: string;
    image: string;
}

interface CartGroupProps {
    items: CartItemData[];
}

function CartItem({ items }: CartGroupProps) {
    const firstItem = items[0];
    const slug = firstItem.slug;
    const image = firstItem.image;

    // Extract base product name (strip variant suffix " - xxx")
    const productName = firstItem.title.split(' - ')[0];

    const hasVariants = items.some((item) => item.title.includes(' - '));

    const groupTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const removeGroupHandler = () => {
        items.forEach((item) =>
            useCartStore.getState().removeItemFromCart(item.id)
        );
    };

    // Normalize slug for Link
    const linkPath = slug.startsWith('/products/')
        ? slug
        : `/products/${slug}`;

    return (
        <li className="item border-b border-[#dddddd] pb-[20px] mb-[20px] last:mb-0 last:pb-0 last:border-b-0">
            <div className="flex items-start">
                <div className="item-img shrink-0 w-[70px]">
                    <Link href={linkPath}>
                        <img
                            src={image}
                            alt={productName}
                            className="w-full"
                        />
                    </Link>
                </div>
                <div className="item-content flex-1 pl-[15px]">
                    <div className="flex items-start justify-between">
                        <h3 className="leading-[21px]">
                            <Link
                                href={linkPath}
                                className="text-[15px] font-medium transition-all hover:text-primary"
                            >
                                {productName}
                            </Link>
                        </h3>
                        <button
                            type="button"
                            className="item-remove shrink-0 ml-[8px]"
                            onClick={removeGroupHandler}
                        >
                            <IoCloseOutline />
                        </button>
                    </div>
                    {hasVariants ? (
                        <div className="mt-[8px] space-y-[4px]">
                            {items.map((item) => {
                                const variantName = item.title.includes(
                                    ' - '
                                )
                                    ? item.title
                                          .split(' - ')
                                          .slice(1)
                                          .join(' - ')
                                    : item.title;
                                return (
                                    <div
                                        key={item.id}
                                        className="flex justify-between text-[13px] text-[#666666]"
                                    >
                                        <span>
                                            {variantName} x{item.quantity}
                                        </span>
                                        <span>
                                            {formatPrice(
                                                item.price * item.quantity
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                            <div className="flex justify-between text-[13px] font-medium pt-[6px] border-t border-[#eee]">
                                <span>小計</span>
                                <span>{formatPrice(groupTotal)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-[4px] text-[13px] text-[#666666]">
                            <div>數量：{firstItem.quantity}</div>
                            <div>
                                價格：{formatPrice(firstItem.price)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
}

export default CartItem;
