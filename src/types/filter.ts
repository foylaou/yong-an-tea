export interface FilterDataItem {
    group: string;
    key: string;
    title: string;
}

export interface FilterState {
    filterData: FilterDataItem[];
}
