import Faq from "@/components/helendo/FAQ/FAQ";


export default function FaqPage() {
    // 範例 FAQ 數據
    const faqItems = [
        {
            id: 1,
            question: "如何註冊一個帳戶？",
            answer: "點擊頁面右上角的「註冊」按鈕，填寫相關資訊後點擊提交即可完成註冊。"
        },
        {
            id: 2,
            question: "忘記密碼怎麼辦？",
            answer: "在登入頁面點擊「忘記密碼」，通過電子郵件或簡訊驗證後可以重新設置密碼。"
        },
        {
            id: 3,
            question: "如何聯繫客服？",
            answer: "您可以通過網站底部的聯繫表單、客服電話 0800-123-456 或發送郵件至 support@example.com 與我們聯繫。"
        },
        {
            id: 4,
            question: "退換貨政策是什麼？",
            answer: "本網站提供七天內無條件退換貨服務，商品必須保持全新狀態且包裝完整。詳情請參閱退換貨政策頁面。"
        },
        {
            id: 5,
            question: "配送時間多長？",
            answer: "一般情況下，訂單確認後 2-3 個工作日內發貨，台灣本島地區約 1-2 天送達，離島地區約 3-5 天送達。"
        }
    ];

    // 標題和描述
    const faqTitle = "常見問題解答";
    const faqDescription = "我們整理了客戶最常遇到的問題和解答，希望能夠幫助您快速找到所需的資訊。";

    return (
        <div className="page-container flex justify-center ">
            <Faq
                faqItems={faqItems}
                title={faqTitle}
                desc={faqDescription}
            />
        </div>
    );
}