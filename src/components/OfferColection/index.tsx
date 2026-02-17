import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';
import CountDown from '../CountDown';
import { useSettingsStore } from '../../store/settings/settings-slice';
import { useShallow } from 'zustand/react/shallow';

function OfferColection() {
    const o = useSettingsStore(useShallow((s) => ({
        enabled: s.offer_enabled,
        title: s.offer_title,
        desc: s.offer_desc,
        countdownDate: s.offer_countdown_date,
        link: s.offer_link,
        image: s.offer_image,
        btnText: s.btn_shop_now,
    })));

    const secondaryButton =
        'inline-flex items-center bg-secondary text-white leading-[38px] text-[15px] h-[38px] px-[32px] transition-all hover:bg-[#222222]';

    const [timerDays, setTimerDays] = useState<number>(0);
    const [timerHours, setTimerHours] = useState<number>(0);
    const [timerMinutes, setTimerMinutes] = useState<number>(0);
    const [timerSeconds, setTimerSeconds] = useState<number>(0);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const countDownDate = new Date(o.countdownDate).getTime();
        if (isNaN(countDownDate)) return;

        intervalRef.current = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(intervalRef.current!);
                setTimerDays(0);
                setTimerHours(0);
                setTimerMinutes(0);
                setTimerSeconds(0);
            } else {
                setTimerDays(Math.floor(distance / (24 * 60 * 60 * 1000)));
                setTimerHours(Math.floor((distance % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)));
                setTimerMinutes(Math.floor((distance % (60 * 60 * 1000)) / (1000 * 60)));
                setTimerSeconds(Math.floor((distance % (60 * 1000)) / 1000));
            }
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [o.countdownDate]);

    if (o.enabled === 'false') return null;

    return (
        <div className="offer-colection xl:pt-[130px] lg:pt-[80px] md:pt-[60px] pt-[35px]">
            <div className="container-fluid px-[15px]">
                <div
                    className="bg-no-repeat bg-cover bg-center flex items-center h-[635px]"
                    style={{ backgroundImage: `url('${o.image}')` }}
                >
                    <div className="container">
                        <div className="grid grid-cols-12">
                            <div className="md:col-span-7 col-span-12">
                                <div className="content">
                                    <h2
                                        className="offer-colection-title relative pb-[10px] mb-[30px] after:absolute after:left-0 after:bottom-0 after:bg-primary after:h-[4px] after:w-[70px]"
                                        dangerouslySetInnerHTML={{
                                            __html: o.title,
                                        }}
                                    />
                                    <p className="mb-[50px]">
                                        {o.desc}
                                    </p>
                                    <CountDown
                                        timerDays={timerDays}
                                        timerHours={timerHours}
                                        timerMinutes={timerMinutes}
                                        timerSeconds={timerSeconds}
                                    />
                                    <div className="mt-[60px]">
                                        <Link
                                            href={o.link || '/'}
                                            className={secondaryButton}
                                        >
                                            {o.btnText}
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

export default OfferColection;
