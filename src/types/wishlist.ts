export interface WishlistItem {
    id: string;
    price: number;
    quantity: number;
    totalPrice: number;
    name: string;
    image: string;
    slug: string;
}

export interface WishlistState {
    items: WishlistItem[];
    totalQuantity: number;
    changed: boolean;
}
