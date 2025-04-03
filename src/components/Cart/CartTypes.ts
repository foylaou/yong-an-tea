// src/components/Cart/CartTypes.ts

export interface CartProps {
    minicart: boolean;
    showMiniCart: () => void;
}

export interface BaseCartItem {
    id: string | number;
    slug: string;
    image: string;
    price: number;
    quantity: number;
}

export interface CartItemType extends BaseCartItem {
    name: string;
    totalPrice: number;
}

export interface RootState {
    cart: {
        items: CartItemType[];
    };
}

export interface CartItemProps {
    item: BaseCartItem & {
        title: string;
        total?: number;
    };
}

export interface CartThItem {
    id: string | number;
    thCName: string;
    thName: string;
}

export interface CartPageItem {
    cartThList?: CartThItem[];
    shopPageBtnText?: string;
    clearCartBtnText?: string;
    couponTitle?: string;
    couponDesc?: string;
    couponBtnText?: string;
    proceedBtnText?: string;
}

export interface CartItem {
    id: string;
    name: string;
    title: string; // 🔧 加上這行
    price: number;
    quantity: number;
    totalPrice: number;
    image: string;
    slug: string;
}
