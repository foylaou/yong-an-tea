"use client"
import Link from 'next/link';
import { useState } from 'react';

const inputField = `border border-[#cccccc] focus-visible:outline-0 text-[#666666] py-[10px] px-[20px] w-full h-[50px]`;
const secondaryButton =
    'flex items-center justify-center bg-secondary text-white leading-[38px] text-[15px] h-[50px] w-full transition-all hover:bg-[#212529] px-[40px]';

interface TabMenu {
    id: string | number;
    tabStateNo: number;
    authMenuName: string;
}

interface AuthItem {
    authTabMenu: TabMenu[];
}

interface AuthFormProps {
    authItems: AuthItem[];
}

export default function AuthForm({ authItems }: AuthFormProps) {
    // Auth Tab
    const [authTabState, setAuthTabState] = useState<number>(1);
    const authTab = (index: number) => {
        setAuthTabState(index);
    };
    return (
        <div className="border-b border-[#ededed] xl:py-[155px] lg:py-[100px] md:py-[80px] py-[50px]">
            <div className="container md:max-w-lg">
                <ul className="auth-menu flex justify-center pb-[50px]">
                    {authItems[0]?.authTabMenu?.map((singleTabMenu) => (
                        <li
                            key={singleTabMenu.id}
                            className={`${
                                authTabState === singleTabMenu.tabStateNo
                                    ? 'login active'
                                    : 'login text-[#666666]'
                            } mr-[45px] last:mr-0`}
                            onClick={() => authTab(singleTabMenu.tabStateNo)}
                        >
                            <span className="font-semibold cursor-pointer text-[24px] leading-[42px]">
                                {singleTabMenu.authMenuName}
                            </span>
                        </li>
                    ))}
                </ul>
                <div
                    className={
                        authTabState === 1
                            ? 'login-content tab-style-common active'
                            : 'login-content tab-style-common'
                    }
                >
                    <form className="login-form">
                        <h3 className="title text-[18px] mb-[25px]">
                            Login your account
                        </h3>
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="text"
                                placeholder="Username"
                            />
                        </div>
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="password"
                                placeholder="Password"
                            />
                        </div>
                        <div className="single-field flex justify-between items-center mb-[30px]">
                            <label className="flex" htmlFor="rememberme">
                                <input type="checkbox" id="rememberme" />
                                <span className="text-[14px] ml-[15px]">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                href="/lost-password"
                                className="text-[14px] font-normal transition-all hover:text-primary"
                            >
                                Lost your password?
                            </Link>
                        </div>
                        <div className="button-wrap">
                            <button type="submit" className={secondaryButton}>
                                Login
                            </button>
                        </div>
                    </form>
                </div>
                <div
                    className={
                        authTabState === 2
                            ? 'Register-content tab-style-common active'
                            : 'Register-content tab-style-common'
                    }
                >
                    <form className="register-form">
                        <h3 className="title text-[18px] mb-[25px]">
                            Register An Account
                        </h3>
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="text"
                                placeholder="Username"
                            />
                        </div>
                        <div className="single-field mb-[30px]">
                            <input
                                className={inputField}
                                type="email"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="single-field">
                            <input
                                className={inputField}
                                type="password"
                                placeholder="Password"
                            />
                        </div>
                        <p className="lg:max-w-[495px] mt-[20px] mb-[25px]">
                            Your personal data will be used to support your
                            experience throughout this website, to manage access
                            to your account, and for other purposes described in
                            our
                            <Link href="/privacy" className="ml-[5px]">
                                privacy policy.
                            </Link>
                        </p>
                        <div className="button-wrap">
                            <button type="submit" className={secondaryButton}>
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}