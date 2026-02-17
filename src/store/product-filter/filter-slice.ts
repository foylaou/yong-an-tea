import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterDataItem, FilterState } from '../../types';

interface FilterActions {
    addFilter: (payload: FilterDataItem) => void;
    removeFilter: (payload: { key: string }) => void;
    clearAll: () => void;
}

export const useFilterStore = create<FilterState & FilterActions>()(
    persist(
        (set) => ({
            filterData: [],

            addFilter: (payload) =>
                set((state) => {
                    const itemIndex = state.filterData.findIndex(
                        (item) =>
                            item.group === payload.group &&
                            item.key === payload.key
                    );
                    if (itemIndex === -1) {
                        return {
                            filterData: [payload, ...state.filterData],
                        };
                    }
                    const filterStateClone = JSON.parse(
                        JSON.stringify(state.filterData)
                    ) as FilterDataItem[];
                    filterStateClone[itemIndex] = payload;
                    return { filterData: filterStateClone };
                }),

            removeFilter: (payload) =>
                set((state) => ({
                    filterData: state.filterData.filter(
                        (singleData) => singleData.key !== payload.key
                    ),
                })),

            clearAll: () => set({ filterData: [] }),
        }),
        {
            name: 'filter-storage',
        }
    )
);
