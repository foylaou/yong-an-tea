import { IoCloseOutline, IoSearchOutline } from 'react-icons/io5';

interface SearchBarProps {
    fullscreenSearch: boolean;
    showFullscreenSearch: () => void;
}

function SearchBar({ fullscreenSearch, showFullscreenSearch }: SearchBarProps) {
    return (
        <div
            className={
                fullscreenSearch
                    ? 'fullscreen-search active'
                    : 'fullscreen-search'
            }
        >
            <div className="homebox-container xl:w-[1170px] mx-auto">
                <div className="searchbar-top flex justify-between">
                    <h2 className="text-[26px]">搜尋</h2>
                    <IoCloseOutline
                        className="text-[#212121] text-[32px] cursor-pointer transition-all hover:text-primary"
                        onClick={showFullscreenSearch}
                    />
                </div>
                <form className="filter-form pt-[60px]">
                    <div className="inner-form lg:w-[875px] md:w-[710px] mx-auto">
                        <div className="single-field relative pt-[65px]">
                            <input
                                type="search"
                                className="input-field w-full outline-hidden border-0 border-b h-[40px] p-[15px_50px_15px_0]"
                                placeholder="搜尋..."
                            />
                            <button
                                type="submit"
                                className="text-[20px] absolute top-auto h-[40px] right-[15px] transition-all hover:text-primary"
                            >
                                <IoSearchOutline />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SearchBar;
