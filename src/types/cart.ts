export interface CartItem {
    id: string;
    price: number;
    quantity: number;
    totalPrice: number;
    name: string;
    image: string;
    slug: string;
}

export interface CartState {
    items: CartItem[];
    totalQuantity: number;
    changed: boolean;
}
