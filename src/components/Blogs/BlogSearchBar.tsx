"use client";
import { IoSearchOutline } from 'react-icons/io5';
import React from "react";

interface BlogSearchBarProps {
    value: string;
    changeInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BlogSearchBar({ value, changeInput }: BlogSearchBarProps) {
    return (
        <form>
            <div className="input-field relative w-full">
                <input
                    placeholder="Search ..."
                    type="text"
                    value={value}
                    onChange={changeInput}
                    className="bg-transparent border-0 border-b border-[rgba(0,0,0,.25)] outline-none w-full p-[10px_0_10px_35px] focus-visible:border-primary"
                />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 text-xl opacity-50">
                    <span className="flex">
                        <IoSearchOutline />
                    </span>
                </div>
            </div>
        </form>
    );
}