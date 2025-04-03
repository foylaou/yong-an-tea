import {useState, useEffect, useRef, JSX} from 'react';
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';
import CountDown from "@/components/CountDown/CountDown";

/**
 * Offer 區塊單一項目
 *
 * @interface OfferItem
 * @property {string} title 標題內容（HTML 格式）
 * @property {string} desc 描述內容
 */
interface OfferItem {
    title: string;
    desc: string;
}

/**
 * OfferColection 組件參數
 *
 * @interface OfferColectionProps
 * @property {OfferItem[]} offerColection 限時優惠資料陣列
 */
interface OfferColectionProps {
    offerColection: OfferItem[];
}

/**
 * OfferColection - 限時優惠區塊元件
 *
 * @param {OfferColectionProps} props 元件參數
 * @returns {JSX.Element} 限時優惠區塊
 */
export default function OfferColection({
                                           offerColection,
                                       }: OfferColectionProps): JSX.Element {
    const [timerDays, setTimerDays] = useState<number>(0);
    const [timerHours, setTimerHours] = useState<number>(0);
    const [timerMinutes, setTimerMinutes] = useState<number>(0);
    const [timerSeconds, setTimerSeconds] = useState<number>(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * 啟動倒數計時器
     */
    const startTimer = () => {
        const countDownDate = new Date('December 01, 2023').getTime();

        intervalRef.current = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(intervalRef.current!);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimerDays(days);
            setTimerHours(hours);
            setTimerMinutes(minutes);
            setTimerSeconds(seconds);
        }, 1000);
    };

    useEffect(() => {
        startTimer();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const secondaryButton =
        'inline-flex items-center bg-secondary text-white leading-[38px] text-[15px] h-[38px] px-[32px] transition-all hover:bg-[#222222]';

    return (
        <div className="offer-colection xl:pt-[130px] lg:pt-[80px] md:pt-[60px] pt-[35px]">
            <div className="container-fluid px-[15px]">
                <div className="bg-offer-colection bg-no-repeat bg-cover bg-center flex items-center h-[635px]">
                    <div className="container">
                        <div className="grid grid-cols-12">
                            <div className="md:col-span-7 col-span-12">
                                <div className="content">
                                    <h2
                                        className="offer-colection-title relative pb-[10px] mb-[30px] after:absolute after:left-0 after:bottom-0 after:bg-primary after:h-[4px] after:w-[70px]"
                                        dangerouslySetInnerHTML={{
                                            __html: offerColection[0].title,
                                        }}
                                    />
                                    <p className="mb-[50px]">{offerColection[0].desc}</p>
                                    <CountDown
                                        timerDays={timerDays}
                                        timerHours={timerHours}
                                        timerMinutes={timerMinutes}
                                        timerSeconds={timerSeconds}
                                    />
                                    <div className="mt-[60px]">
                                        <Link href="/" className={secondaryButton}>
                                            Shop Now
                                            <IoArrowForwardOutline className="text-white ml-[5px]" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
