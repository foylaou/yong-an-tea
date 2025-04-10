"use client"
import Link from 'next/link';
import { useState } from 'react';
import {AuthItem} from "@/components/Auth/AuthTypes";

const inputField = `border border-gray-300 rounded-md focus-visible:outline-0 focus:ring-2 focus:ring-[#dcb14a]/50 text-gray-600 py-3 px-4 w-full h-[50px] transition-all`;
const secondaryButton =
    'flex items-center justify-center bg-black text-white font-medium text-base h-[50px] w-full transition-all hover:bg-gray-800 rounded-md px-6 shadow-sm hover:shadow';
const ssoButton =
    'flex items-center justify-center border border-gray-300 bg-white text-gray-700 font-medium text-sm h-[46px] w-full transition-all hover:bg-gray-50 rounded-md px-4 shadow-sm mb-3';

/**
 * 授權表單屬性
 * 傳入的授權資料集合。
 *
 * @interface AuthFormProps
 * @member {AuthItem[]} authItems 授權項目的陣列
 */
export interface AuthFormProps {
    authItems: AuthItem[];
}

export default function AuthForm({ authItems }: AuthFormProps) {
    // Auth Tab
    const [authTabState, setAuthTabState] = useState<number>(1);
    const authTab = (index: number) => {
        setAuthTabState(index);
    };
    return (
        <div className="w-full py-4">
            <div className="container mx-auto max-w-md">
                <ul className="flex justify-center space-x-12 mb-10">
                    {authItems[0]?.authTabMenu?.map((singleTabMenu) => (
                        <li
                            key={singleTabMenu.id}
                            className={`${
                                authTabState === singleTabMenu.tabStateNo
                                    ? 'border-b-2 border-[#dcb14a]'
                                    : 'text-gray-500 border-b-2 border-transparent'
                            } pb-2 transition-all`}
                            onClick={() => authTab(singleTabMenu.tabStateNo)}
                        >
                            <span className="font-semibold cursor-pointer text-xl">
                                {singleTabMenu.authMenuName}
                            </span>
                        </li>
                    ))}
                </ul>
                <div
                    className={
                        authTabState === 1
                            ? 'login-content active'
                            : 'login-content hidden'
                    }
                >
                    <form className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-medium text-gray-800 mb-6">
                            登入您的帳號
                        </h3>
                        <div className="mb-6">
                            <button type="button" className={ssoButton}>
                                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2"><path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" /></svg>
                                <span>使用 Facebook 帳號登入</span>
                            </button>
                            <button type="button" className={ssoButton}>
                                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/><path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2704 14.29L1.28027 17.385C3.25527 21.31 7.31027 24.0001 12.0004 24.0001Z" fill="#34A853"/></svg>
                                <span>使用 Google 帳號登入</span>
                            </button>
                            <button type="button" className={ssoButton}>
                                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                                <span>使用 X 帳號登入</span>
                            </button>
                        </div>

                        <div className="relative flex items-center justify-center mb-6">
                            <hr className="w-full border-gray-300" />
                            <span className="absolute bg-white px-2 text-sm text-gray-500">或</span>
                        </div>

                        <div className="mb-5">
                            <input
                                className={inputField}
                                type="text"
                                placeholder="使用者名稱"
                            />
                        </div>
                        <div className="mb-5">
                            <input
                                className={inputField}
                                type="password"
                                placeholder="密碼"
                            />
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <label className="flex items-center" htmlFor="rememberme">
                                <input
                                    type="checkbox"
                                    id="rememberme"
                                    className="rounded border-gray-300 text-[#dcb14a] focus:ring-[#dcb14a]"
                                />
                                <span className="text-sm ml-2 text-gray-600">
                                    記住我
                                </span>
                            </label>
                            <Link
                                href="/lost-password"
                                className="text-sm font-medium transition-all text-gray-600 hover:text-[#dcb14a]"
                            >
                                忘記密碼？
                            </Link>
                        </div>
                        <div className="button-wrap">
                            <button type="submit" className={secondaryButton}>
                                登入
                            </button>
                        </div>
                    </form>
                </div>
                <div
                    className={
                        authTabState === 2
                            ? 'register-content active'
                            : 'register-content hidden'
                    }
                >
                    <form className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-medium text-gray-800 mb-6">
                            註冊新帳號
                        </h3>
                        <div className="mb-6">
                            <button type="button" className={ssoButton}>
                                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2"><path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" /></svg>
                                <span>使用 Facebook 帳號註冊</span>
                            </button>
                            <button type="button" className={ssoButton}>
                                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/><path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2704 14.29L1.28027 17.385C3.25527 21.31 7.31027 24.0001 12.0004 24.0001Z" fill="#34A853"/></svg>
                                <span>使用 Google 帳號註冊</span>
                            </button>
                            <button type="button" className={ssoButton}>
                                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                                <span>使用 X 帳號註冊</span>
                            </button>
                        </div>

                        <div className="relative flex items-center justify-center mb-6">
                            <hr className="w-full border-gray-300" />
                            <span className="absolute bg-white px-2 text-sm text-gray-500">或</span>
                        </div>

                        <div className="mb-5">
                            <input
                                className={inputField}
                                type="text"
                                placeholder="使用者名稱"
                            />
                        </div>
                        <div className="mb-5">
                            <input
                                className={inputField}
                                type="email"
                                placeholder="電子郵件地址"
                            />
                        </div>
                        <div className="mb-5">
                            <input
                                className={inputField}
                                type="password"
                                placeholder="密碼"
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-5 mb-6">
                            您的個人資料將用於提升您在本網站的體驗，管理您的帳號存取權限，以及用於我們
                            <Link href="/privacy" className="ml-1 text-[#dcb14a] hover:underline">
                                隱私政策
                            </Link>
                            中描述的其他用途。
                        </p>
                        <div className="button-wrap">
                            <button type="submit" className={secondaryButton}>
                                註冊
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
