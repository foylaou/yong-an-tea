import { useState } from 'react';
import { useRouter } from 'next/router';
import { IoSearchOutline } from 'react-icons/io5';

interface SearchBarCompsProps {
    placeholdertext: string;
}

function SearchBarComps({ placeholdertext }: SearchBarCompsProps) {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(`/search?q=${encodeURIComponent(q)}`);
        setQuery('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-field relative max-w-[270px]">
                <input
                    type="search"
                    name="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholdertext}
                    className="bg-transparent border-0 border-b border-[rgba(0,0,0,.25)] outline-hidden w-full p-[10px_35px_10px_0] focus-visible:border-primary"
                />
                <button
                    type="submit"
                    className="absolute top-1/2 -translate-y-1/2 right-0 text-2xl"
                >
                    <IoSearchOutline />
                </button>
            </div>
        </form>
    );
}

export default SearchBarComps;
