import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartState } from '../../types';

interface AddToCartPayload {
    id: string;
    title: string;
    price: number;
    quantity?: number;
    totalPrice?: number;
    image: string;
    slug: string;
}

interface CartActions {
    replaceCart: (payload: { totalQuantity: number; items: CartItem[] }) => void;
    addItemToCart: (payload: AddToCartPayload) => void;
    increaseItemFromCart: (id: string) => void;
    removeItemFromCart: (id: string) => void;
    updateItemQuantityFromCart: (newQuantity: Record<string, number>) => void;
    clearAllFromCart: () => void;
}

export const useCartStore = create<CartState & CartActions>()(
    persist(
        (set) => ({
            items: [],
            totalQuantity: 0,
            changed: false,

            replaceCart: (payload) =>
                set({
                    totalQuantity: payload.totalQuantity,
                    items: payload.items,
                }),

            addItemToCart: (payload) =>
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === payload.id
                    );
                    const itemQuantity = payload.quantity || 1;

                    if (!existingItem) {
                        return {
                            totalQuantity: state.totalQuantity + itemQuantity,
                            changed: true,
                            items: [
                                ...state.items,
                                {
                                    id: payload.id,
                                    price: payload.price,
                                    quantity: itemQuantity,
                                    totalPrice: payload.price,
                                    name: payload.title,
                                    image: payload.image,
                                    slug: payload.slug,
                                },
                            ],
                        };
                    }

                    return {
                        totalQuantity: state.totalQuantity + itemQuantity,
                        changed: true,
                        items: state.items.map((item) =>
                            item.id === payload.id
                                ? {
                                      ...item,
                                      quantity: item.quantity + 1,
                                      totalPrice:
                                          item.totalPrice + payload.price,
                                  }
                                : item
                        ),
                    };
                }),

            increaseItemFromCart: (id) =>
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.id === id
                    );
                    if (!existingItem) return state;

                    if (existingItem.quantity === 1) {
                        return {
                            totalQuantity: state.totalQuantity - 1,
                            changed: true,
                            items: state.items.filter(
                                (item) => item.id !== id
                            ),
                        };
                    }

                    return {
                        totalQuantity: state.totalQuantity - 1,
                        changed: true,
                        items: state.items.map((item) =>
                            item.id === id
                                ? {
                                      ...item,
                                      quantity: item.quantity - 1,
                                      totalPrice:
                                          item.totalPrice - item.price,
                                  }
                                : item
                        ),
                    };
                }),

            removeItemFromCart: (id) =>
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

            updateItemQuantityFromCart: (newQuantity) =>
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

            clearAllFromCart: () =>
                set({
                    changed: true,
                    items: [],
                    totalQuantity: 0,
                }),
        }),
        {
            name: 'cart-storage',
        }
    )
);
