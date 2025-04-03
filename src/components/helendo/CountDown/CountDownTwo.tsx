interface CountDownTwoProps {
    timerDays?: number;
    timerHours?: number;
    timerMinutes?: number;
    timerSeconds?: number;
}

export default function CountDownTwo({
                                         timerDays = 10,
                                         timerHours = 10,
                                         timerMinutes = 10,
                                         timerSeconds = 10
                                     }: CountDownTwoProps) {
    return (
        <div className="timer-container">
            <div className="timer">
                <div className="clock flex text-center">
                    <div className="mr-[40px]">
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerDays}
                        </h4>
                        <span className="capitalize font-normal">Days</span>
                    </div>
                    <div className="mr-[40px]">
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerHours}
                        </h4>
                        <span className="capitalize font-normal">Hours</span>
                    </div>
                    <div className="mr-[40px]">
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerMinutes}
                        </h4>
                        <span className="capitalize font-normal">Minutes</span>
                    </div>
                    <div>
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerSeconds}
                        </h4>
                        <span className="capitalize font-normal">Seconds</span>
                    </div>
                </div>
            </div>
        </div>
    );
}