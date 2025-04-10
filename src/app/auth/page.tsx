import AuthForm, { AuthFormProps } from "@/components/Auth/AuthForm";
import { JSX } from "react";

/**
 * Auth Page 元件
 * 顯示授權表單，並帶入靜態測試資料。
 *
 * @returns {JSX.Element} 授權表單頁面
 */
export default function Page(): JSX.Element {
    const data: AuthFormProps = {
        authItems: [
            {
                authTabMenu: [
                    {
                        id: 'menu-1',
                        tabStateNo: 1,
                        authMenuName: '登入',
                    },
                    {
                        id: 'menu-2',
                        tabStateNo: 2,
                        authMenuName: '註冊',
                    },
                ],
            },
            {
                authTabMenu: [
                    {
                        id: 3,
                        tabStateNo: 3,
                        authMenuName: '系統設定',
                    },
                ],
            },
        ],
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full min-2xl:">
                <AuthForm authItems={data.authItems} />
            </div>
        </div>
    );
}
