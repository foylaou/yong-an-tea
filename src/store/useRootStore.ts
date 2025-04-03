import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from "@/components/Cart/CartTypes";
import { FilterState } from "@/components/Products/ProductsTypes";
import {WishlistItem} from "@/store/wishlist/useWishlistStore";


// Define the overall store state interface
interface RootState {
    cart: {
        items: CartItem[];
        totalQuantity: number;
        addToCart: (item: CartItem) => void;
        removeFromCart: (id: string | number) => void;
        clearCart: () => void;
        updateItemQuantity: (id: string | number, quantity: number) => void;
    };

    wishlist: {
        items: WishlistItem[];
        totalQuantity: number;
        addToWishlist: (item: WishlistItem) => void;
        removeFromWishlist: (id: string | number) => void;
        clearWishlist: () => void;
    };

    filter: FilterState & {
        updateFilter: (newFilter: Partial<FilterState>) => void;
        resetFilter: () => void;
    };
}

// Create the Zustand store with persist middleware
const useRootStore = create<RootState>()(
    persist(
        (set) => ({
            cart: {
                items: [] as CartItem[], // Update the initial state type
                get totalQuantity() {
                    return this.items.reduce((total, item) => total + item.quantity, 0);
                },
                addToCart: (item) => set((state) => ({
                    ...state,
                    cart: {
                        ...state.cart,
                        items: [...state.cart.items, item]
                    }
                })),
                removeFromCart: (id) => set((state) => ({
                    ...state,
                    cart: {
                        ...state.cart,
                        items: state.cart.items.filter(item => item.id !== id)
                    }
                })),
                clearCart: () => set((state) => ({
                    ...state,
                    cart: {
                        ...state.cart,
                        items: []
                    }
                })),
                updateItemQuantity: (id, quantity) => set((state) => ({
                    ...state,
                    cart: {
                        ...state.cart,
                        items: state.cart.items.map(item =>
                            item.id === id
                                ? { ...item, quantity, totalPrice: item.price * quantity }
                                : item
                        )
                    }
                })),
            },

            wishlist: {
                items: [],
                get totalQuantity() {
                    return this.items.length;
                },
                addToWishlist: (item) => set((state) => ({
                    ...state,
                    wishlist: {
                        ...state.wishlist,
                        items: [...state.wishlist.items, item]
                    }
                })),
                removeFromWishlist: (id) => set((state) => ({
                    ...state,
                    wishlist: {
                        ...state.wishlist,
                        items: state.wishlist.items.filter(item => item.id !== id)
                    }
                })),
                clearWishlist: () => set((state) => ({
                    ...state,
                    wishlist: {
                        ...state.wishlist,
                        items: []
                    }
                })),
            },

            filter: {
                // Ensure this matches the FilterState interface exactly
                filterData: [],
                sortBy: 'default',
                priceRange: { min: 0, max: 1000 },
                categories: [],

                updateFilter: (newFilter) => set((state) => ({
                    ...state,
                    filter: {
                        ...state.filter,
                        ...newFilter,
                        updateFilter: state.filter.updateFilter,
                        resetFilter: state.filter.resetFilter
                    }
                })),
                resetFilter: () => set((state) => {
                    const defaultFilter = {
                        filterData: [],
                        sortBy: 'default',
                        priceRange: { min: 0, max: 1000 },
                        categories: [],
                        updateFilter: state.filter.updateFilter,
                        resetFilter: state.filter.resetFilter
                    };

                    return {
                        ...state,
                        filter: defaultFilter
                    };
                }),
            },
        }),
        {
            name: 'root-storage', // unique name
            partialize: (state) => ({
                cart: state.cart,
                wishlist: state.wishlist,
                filter: state.filter
            }),
        }
    )
);

export default useRootStore;