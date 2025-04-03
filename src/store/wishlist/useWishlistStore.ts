import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the Wishlist Item interface
export interface WishlistItem {
    id: string;
    title: string;
    name: string;
    price: number;
    totalPrice?: number;
    quantity: number;
    image: string;
    slug: string;
}


// Define the Wishlist State interface
interface WishlistState {
    items: WishlistItem[];
    totalQuantity: number;
    changed: boolean;

    // Actions
    replaceWishlist: (payload: { items: WishlistItem[], totalQuantity: number }) => void;
    addItemToWishlist: (newItem: Partial<WishlistItem>) => void;
    removeItemFromWishlist: (id: string | number) => void;
    updateItemQuantityFromWishlist: (newQuantity: Record<string | number, number>) => void;
    clearAllFromWishlist: () => void;
}

// Create the Zustand store with persist middleware
const useWishlistStore = create<WishlistState>()(
    persist(
        (set) => ({
            items: [],
            totalQuantity: 0,
            changed: false,

            replaceWishlist: (payload) => set({
                items: payload.items,
                totalQuantity: payload.totalQuantity,
                changed: true
            }),

            addItemToWishlist: (newItem) => set((state) => {
                // Check if item already exists
                const existingItem = state.items.find(
                    (item) => item.id === newItem.id
                );

                if (!existingItem) {
                    // Add new item
                    const itemToAdd: WishlistItem = {
                        id: newItem.id!,
                        price: newItem.price!,
                        quantity: 1,
                        totalPrice: newItem.price!,
                        name: newItem.title || '',
                        image: newItem.image!,
                        slug: newItem.slug!,
                        title: newItem.title || '', // Add title property
                    };

                    return {
                        items: [...state.items, itemToAdd],
                        totalQuantity: state.totalQuantity + 1,
                        changed: true
                    };
                } else {
                    // Update existing item
                    const updatedItems = state.items.map(item =>
                        item.id === newItem.id
                            ? {
                                ...item,
                                quantity: item.quantity + 1,
                                totalPrice: (item.totalPrice ?? 0) + newItem.price!
                            }
                            : item
                    );

                    return {
                        items: updatedItems,
                        totalQuantity: state.totalQuantity + 1,
                        changed: true
                    };
                }
            }),

            removeItemFromWishlist: (id) => set((state) => {
                const filteredItems = state.items.filter((item) => item.id !== id);

                return {
                    items: filteredItems,
                    totalQuantity: filteredItems.reduce(
                        (acc, cur) => acc + cur.quantity,
                        0
                    ),
                    changed: true
                };
            }),

            updateItemQuantityFromWishlist: (newQuantity) => set((state) => {
                const updatedItems = state.items.map((item) => ({
                    ...item,
                    quantity: newQuantity[item.id] || item.quantity,
                    totalPrice: item.price * (newQuantity[item.id] || item.quantity)
                }));

                return {
                    items: updatedItems,
                    totalQuantity: updatedItems.reduce(
                        (acc, cur) => acc + cur.quantity,
                        0
                    ),
                    changed: true
                };
            }),

            clearAllFromWishlist: () => set({
                items: [],
                totalQuantity: 0,
                changed: true
            })
        }),
        {
            name: 'wishlist-storage',
            partialize: (state) => ({
                items: state.items,
                totalQuantity: state.totalQuantity
            })
        }
    )
);

export default useWishlistStore;