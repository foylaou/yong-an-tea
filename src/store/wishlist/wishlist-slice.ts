import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistItem, WishlistState } from '../../types';

interface AddToWishlistPayload {
    id: string;
    title: string;
    price: number;
    totalPrice?: number;
    image: string;
    slug: string;
}

interface WishlistActions {
    replaceWishlist: (payload: {
        totalQuantity: number;
        items: WishlistItem[];
    }) => void;
    addItemToWishlist: (payload: AddToWishlistPayload) => void;
    removeItemFromWishlist: (id: string) => void;
    updateItemQuantityFromWishlist: (
        newQuantity: Record<string, number>
    ) => void;
    clearAllFromWishlist: () => void;
}

export const useWishlistStore = create<WishlistState & WishlistActions>()(
    persist(
        (set) => ({
            items: [],
            totalQuantity: 0,
            changed: false,

            replaceWishlist: (payload) =>
                set({
                    totalQuantity: payload.totalQuantity,
                    items: payload.items,
                }),

            addItemToWishlist: (payload) =>
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === payload.id
                    );

                    // 已在願望清單中，不重複加入
                    if (existingItem) return state;

                    return {
                        totalQuantity: state.totalQuantity + 1,
                        changed: true,
                        items: [
                            ...state.items,
                            {
                                id: payload.id,
                                price: payload.price,
                                quantity: 1,
                                totalPrice: payload.price,
                                name: payload.title,
                                image: payload.image,
                                slug: payload.slug,
                            },
                        ],
                    };
                }),

            removeItemFromWishlist: (id) =>
                set((state) => {
                    const newItems = state.items.filter(
                        (item) => item.id !== id
                    );
                    return {
                        changed: true,
                        items: newItems,
                        totalQuantity: newItems.reduce(
                            (acc, cur) => acc + cur.quantity,
                            0
                        ),
                    };
                }),

            updateItemQuantityFromWishlist: (newQuantity) =>
                set((state) => {
                    const newItems = state.items.map((item) => ({
                        ...item,
                        quantity: newQuantity[item.id] || item.quantity,
                        totalPrice:
                            item.price * (newQuantity[item.id] || item.quantity),
                    }));
                    return {
                        changed: true,
                        items: newItems,
                        totalQuantity: newItems.reduce(
                            (acc, cur) => acc + cur.quantity,
                            0
                        ),
                    };
                }),

            clearAllFromWishlist: () =>
                set({
                    changed: true,
                    items: [],
                    totalQuantity: 0,
                }),
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
