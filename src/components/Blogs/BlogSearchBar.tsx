import { IoSearchOutline } from 'react-icons/io5';

interface BlogSearchBarProps {
    value: string;
    changeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function BlogSearchBar({ value, changeInput }: BlogSearchBarProps) {
    return (
        <form>
            <div className="input-field relative w-full">
                <input
                    placeholder="搜尋..."
                    type="text"
                    value={value}
                    onChange={changeInput}
                    className="bg-transparent border-0 border-b border-[rgba(0,0,0,.25)] outline-hidden w-full p-[10px_0_10px_35px] focus-visible:border-primary"
                />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 text-xl opacity-50">
                    <IoSearchOutline />
                </div>
            </div>
        </form>
    );
}

export default BlogSearchBar;
