import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {FilterItem} from "@/components/Products/ProductsTypes";

// Define the filter item interface


// Define the Filter State interface
interface FilterState {
    filterData: FilterItem[];

    // Actions
    addFilter: (newFilter: FilterItem) => void;
    removeFilter: (payload: { key: string }) => void;
    clearAll: () => void;
}

// Create the Zustand store with persist middleware
const useFilterStore = create<FilterState>()(
    persist(
        (set) => ({
            filterData: [],

            addFilter: (newFilter) => set((state) => {
                // Find if an item with the same group and key already exists
                const itemIndex = state.filterData.findIndex(
                    (item) =>
                        item.group === newFilter.group &&
                        item.key === newFilter.key
                );

                if (itemIndex === -1) {
                    // If no existing item, add the new filter to the beginning of the array
                    return {
                        filterData: [newFilter, ...state.filterData]
                    };
                } else {
                    // If item exists, create a new array with the updated item
                    const updatedFilterData = [...state.filterData];
                    updatedFilterData[itemIndex] = newFilter;

                    return {
                        filterData: updatedFilterData
                    };
                }
            }),

            removeFilter: (payload) => set((state) => ({
                filterData: state.filterData.filter(
                    (singleData) => singleData.key !== payload.key
                )
            })),

            clearAll: () => set({
                filterData: []
            })
        }),
        {
            name: 'filter-storage',
            partialize: (state) => ({
                filterData: state.filterData
            })
        }
    )
);

export default useFilterStore;