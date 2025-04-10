import {AuthFormProps} from "@/components/Auth/AuthForm";


/**
 * 分頁選單項目
 * 表示授權分頁選單的每一個選項。
 *
 * @interface TabMenu
 * @member {string | number} id 唯一識別碼，可為字串或數字
 * @member {number} tabStateNo 分頁狀態編號
 * @member {string} authMenuName 授權選單名稱
 */
export interface TabMenu {
    id: string | number;
    tabStateNo: number;
    authMenuName: string;
}

/**
 * 授權項目
 * 包含一組授權的分頁選單。
 *
 * @interface AuthItem
 * @member {TabMenu[]} authTabMenu 分頁選單項目的陣列
 */
export interface AuthItem {
    authTabMenu: TabMenu[];
}


// ✅ 範例資料
export const data: AuthFormProps = {
    authItems: [
        {
            authTabMenu: [
                {
                    id: 'menu-1',
                    tabStateNo: 0,
                    authMenuName: '使用者管理',
                },
                {
                    id: 'menu-2',
                    tabStateNo: 1,
                    authMenuName: '角色權限',
                },
            ],
        },
        {
            authTabMenu: [
                {
                    id: 3,
                    tabStateNo: 2,
                    authMenuName: '系統設定',
                },
            ],
        },
    ],
};
