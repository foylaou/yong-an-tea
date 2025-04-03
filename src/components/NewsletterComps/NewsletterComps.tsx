import {JSX} from "react";

/**
 * NewsletterComps 元件的參數
 *
 * @interface NewsletterCompsProps
 * @property {string} sectionTitle 區塊標題文字
 */
interface NewsletterCompsProps {
    sectionTitle: string;
}

/**
 * NewsletterComps - 訂閱電子報輸入表單
 *
 * @param {NewsletterCompsProps} props 組件參數
 * @returns {JSX.Element} 電子報訂閱區塊
 */
export default function NewsletterComps({
                                            sectionTitle,
                                        }: NewsletterCompsProps): JSX.Element {
    return (
        <div className="newsletter-area">
            <div className="container">
                <div className="grid md:grid-cols-2">
                    <div className="section-title pb-[10px] md:mb-0 mb-[30px] relative after:bg-primary after:absolute after:left-0 after:transform after:bottom-0 after:h-[4px] after:w-[70px]">
                        <h2>{sectionTitle}</h2>
                    </div>
                    <form className="newsletter-form relative">
                        <input
                            className="w-full bg-[#f4f5f7] h-[54px] lm:p-[10px_170px_10px_20px] p-[10px] focus:outline-none"
                            type="email"
                            placeholder="Your email address"
                        />
                        <button
                            type="submit"
                            className="bg-black text-white lm:absolute lm:top-0 lm:right-0 px-[40px] h-[54px] max-sm:mt-[30px]"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
