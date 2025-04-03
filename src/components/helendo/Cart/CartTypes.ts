export interface CartProps {
    minicart: boolean;
    showMiniCart: () => void;
}

export interface CartItemType {
    id: string | number;
    name: string;
    quantity: number;
    totalPrice: number;
    price: number;
    slug: string;
    image: string;
}

export interface RootState {
    cart: {
        items: CartItemType[];
    };
}

export interface CartItemProps {
    item: {
        id: string | number;
        image: string;
        slug: string;
        title: string;
        quantity: number;
        price: number;
        total?: number;
    };
}