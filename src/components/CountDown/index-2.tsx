interface CountDownTwoProps {
    timerDays?: number;
    timerHours?: number;
    timerMinutes?: number;
    timerSeconds?: number;
}

function CountDownTwo({ timerDays = 10, timerHours = 10, timerMinutes = 10, timerSeconds = 10 }: CountDownTwoProps) {
    return (
        <div className="timer-container">
            <div className="timer">
                <div className="clock flex text-center">
                    <div className="mr-[40px]">
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerDays}
                        </h4>
                        <span className="capitalize font-normal">天</span>
                    </div>
                    <div className="mr-[40px]">
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerHours}
                        </h4>
                        <span className="capitalize font-normal">時</span>
                    </div>
                    <div className="mr-[40px]">
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerMinutes}
                        </h4>
                        <span className="capitalize font-normal">分</span>
                    </div>
                    <div>
                        <h4 className="font-prata text-primary lm:text-[48px] text-[30px]">
                            {timerSeconds}
                        </h4>
                        <span className="capitalize font-normal">秒</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CountDownTwo;
