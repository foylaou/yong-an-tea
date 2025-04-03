"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as IoIcon from "react-icons/io5";
import CountDownTwo from "@/components/CountDown/CountDownTwo";

interface SocialItem {
    id: string | number;
    socialIcon: string;
    path: string;
}

interface ComingSoonItem {
    title?: string;
    desc?: string;
    countTitle?: string;
    socialTitle?: string;
    socialList?: SocialItem[];
}

interface ComingSoonProps {
    comingSoonItems: ComingSoonItem[];
}

export default function ComingSoon({ comingSoonItems }: ComingSoonProps) {
    const [timerDays, setTimerDays] = useState<number>();
    const [timerHours, setTimerHours] = useState<number>();
    const [timerMinutes, setTimerMinutes] = useState<number>();
    const [timerSeconds, setTimerSeconds] = useState<number>();

    const intervalRef = useRef<NodeJS.Timeout | null>(null); // ✅ 使用 ref 儲存 interval

    useEffect(() => {
        const startTimer = () => {
            const countDownDate = new Date("February 01, 2023").getTime();

            intervalRef.current = setInterval(() => {
                const now = new Date().getTime();
                const distance = countDownDate - now;

                if (distance < 0) {
                    clearInterval(intervalRef.current!);
                } else {
                    setTimerDays(Math.floor(distance / (24 * 60 * 60 * 1000)));
                    setTimerHours(Math.floor((distance % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)));
                    setTimerMinutes(Math.floor((distance % (60 * 60 * 1000)) / (1000 * 60)));
                    setTimerSeconds(Math.floor((distance % (60 * 1000)) / 1000));
                }
            }, 1000);
        };

        startTimer();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []); // ✅ 正確地使用空依賴陣列

    return (
        <div className="coming-soon border-b border-[#ededed] xl:pt-[105px] lg:pt-[85px] md:pt-[65px] pt-[35px] xl:pb-[120px] lg:pb-[100px] md:pb-[80px] pb-[50px]">
            <div className="container">
                <div className="grid grid-cols-12">
                    <div className="lg:col-span-6 md:col-span-9 col-span-12">
                        <h2 className="lm:text-[60px] leading-[1.1] text-[34px] mb-[20px]">
                            {comingSoonItems[0]?.title}
                        </h2>
                        <p className="lg:max-w-[530px] mb-[60px]">{comingSoonItems[0]?.desc}</p>
                        <h3 className="lm:text-[18px] text-[16px] mb-[30px]">{comingSoonItems[0]?.countTitle}</h3>

                        <CountDownTwo
                            timerDays={timerDays}
                            timerHours={timerHours}
                            timerMinutes={timerMinutes}
                            timerSeconds={timerSeconds}
                        />

                        <div className="social-link flex items-center pt-[60px]">
                            <h2 className="lm:text-[16px] text-[15px] font-normal md:pr-[65px] pr-[45px]">
                                {comingSoonItems[0]?.socialTitle}
                            </h2>
                            <ul className="flex">
                                {comingSoonItems[0]?.socialList?.map((item) => {
                                    const Social = IoIcon[item.socialIcon as keyof typeof IoIcon];
                                    return (
                                        <li className="mr-[25px] last:mr-0" key={item.id}>
                                            <Link href={item.path} className="transition-all hover:text-primary">
                        <span className="flex">
                          <Social />
                        </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
