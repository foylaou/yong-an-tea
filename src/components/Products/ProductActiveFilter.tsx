import { IoCloseOutline } from 'react-icons/io5';

import { useFilterStore } from '../../store/product-filter/filter-slice';

function ProductActiveFilter() {
    const filter = useFilterStore();
    return (
        <ul className="active-filter-list flex flex-wrap items-center pb-[20px] -mb-[10px]">
            {filter.filterData.map((item: any) => (
                <li className="mr-[10px] mb-[10px]" key={item.key}>
                    <button
                        type="button"
                        className="bg-[#e8e8e8] flex items-center text-[14px] px-[10px]  rounded-[20px] transition-all hover:bg-black hover:text-white"
                    >
                        <span className="mr-[5px]">{item.title}</span>
                        <IoCloseOutline
                            onClick={() =>
                                useFilterStore.getState().removeFilter({
                                    key: item.key,
                                })
                            }
                        />
                    </button>
                </li>
            ))}

            {filter.filterData.length !== 0 && (
                <li className="mb-[10px]">
                    <button
                        onClick={() => useFilterStore.getState().clearAll()}
                        type="button"
                        className="clear-btn text-[14px] transition-all hover:text-primary"
                    >
                        清除全部
                    </button>
                </li>
            )}
        </ul>
    );
}

export default ProductActiveFilter;
