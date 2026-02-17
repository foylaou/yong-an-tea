import Link from 'next/link';
import { IoCloseOutline } from 'react-icons/io5';
import { useCartStore } from '../../store/cart/cart-slice';
import { formatPrice } from '../../store/settings/settings-slice';

interface CartItemData {
    id: string;
    title: string;
    quantity: number;
    total: number;
    price: number;
    slug: string;
    image: string;
}

interface CartItemProps {
    item: CartItemData;
}

function CartItem({ item }: CartItemProps) {
    const { image, slug, title, quantity, price } = item;

    const removeItemFromCartHandler = (id: string) => {
        useCartStore.getState().removeItemFromCart(id);
    };

    return (
        <li className="item flex items-start justify-between border-b border-[#dddddd] pb-[25px] mb-[20px] last:mb-0 last:pb-0 last:border-b-0">
            <div className="item-img">
                <Link href={slug} className="product-img">
                    <img src={image} alt={title} />
                </Link>
            </div>
            <div className="item-content w-[calc(100%-88px)] pl-[20px]">
                <h3 className="leading-[21px]">
                    <Link
                        href={slug}
                        className="text-[15px] transition-all hover:text-primary"
                    >
                        {title}
                    </Link>
                </h3>
                <div className="font-medium text-[15px] leading-[26px]">
                    數量：<span className="text-[#666666]">{quantity}</span>
                </div>
                <div className="font-medium text-[13px] leading-[23px]">
                    價格：{' '}
                    <span className="text-[#666666]">{formatPrice(price)}</span>{' '}
                </div>
            </div>
            <button type="button" className="item-remove flex items-start">
                <IoCloseOutline
                    onClick={() => removeItemFromCartHandler(item.id)}
                />
            </button>
        </li>
    );
}

export default CartItem;
