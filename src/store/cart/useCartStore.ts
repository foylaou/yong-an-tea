import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {CartItem} from "@/components/Cart/CartTypes";

// Define the Cart Item interface

// Define the Cart State interface
interface CartState {
    items: CartItem[];
    totalQuantity: number;
    changed: boolean;

    // Actions
    replaceCart: (payload: { items: CartItem[], totalQuantity: number }) => void;
    addItemToCart: (newItem: Partial<CartItem>) => void;
    increaseItemFromCart: (id: string | number) => void;
    removeItemFromCart: (id: string | number) => void;
    updateItemQuantityFromCart: (newQuantity: Record<string | number, number>) => void;
    clearAllFromCart: () => void;
}

// Create the Zustand store with persist middleware
const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            totalQuantity: 0,
            changed: false,

            replaceCart: (payload) => set({
                items: payload.items,
                totalQuantity: payload.totalQuantity,
                changed: true
            }),

            addItemToCart: (newItem) => set((state) => {
                // Determine the quantity to add
                const itemQuantity = newItem.quantity || 1;

                // Check if item already exists
                const existingItem = state.items.find(
                    (item) => item.id === newItem.id
                );

                if (!existingItem) {
                    // Add new item
                    const itemToAdd: CartItem = {
                        id: newItem.id!,
                        price: newItem.price!,
                        quantity: itemQuantity,
                        totalPrice: newItem.price!,
                        name: newItem.title || '',
                        image: newItem.image!,
                        slug: newItem.slug!,
                        title: newItem.title || '',
                    };

                    return {
                        items: [...state.items, itemToAdd],
                        totalQuantity: state.totalQuantity + itemQuantity,
                        changed: true
                    };
                } else {
                    // Update existing item
                    const updatedItems = state.items.map(item =>
                        item.id === newItem.id
                            ? {
                                ...item,
                                quantity: item.quantity + 1,
                                totalPrice: item.totalPrice + newItem.price!
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

            increaseItemFromCart: (id) => set((state) => {
                const existingItem = state.items.find((item) => item.id === id);

                if (!existingItem) return state;

                if (existingItem.quantity === 1) {
                    // Remove item if quantity is 1
                    return {
                        items: state.items.filter((item) => item.id !== id),
                        totalQuantity: state.totalQuantity - 1,
                        changed: true
                    };
                } else {
                    // Decrease quantity
                    const updatedItems = state.items.map(item =>
                        item.id === id
                            ? {
                                ...item,
                                quantity: item.quantity - 1,
                                totalPrice: item.totalPrice - item.price
                            }
                            : item
                    );

                    return {
                        items: updatedItems,
                        totalQuantity: state.totalQuantity - 1,
                        changed: true
                    };
                }
            }),

            removeItemFromCart: (id) => set((state) => {
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

            updateItemQuantityFromCart: (newQuantity) => set((state) => {
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

            clearAllFromCart: () => set({
                items: [],
                totalQuantity: 0,
                changed: true
            })
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                items: state.items,
                totalQuantity: state.totalQuantity
            })
        }
    )
);

export default useCartStore;