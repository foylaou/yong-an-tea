interface CountDownProps {
    timerDays?: number;
    timerHours?: number;
    timerMinutes?: number;
    timerSeconds?: number;
}

function CountDown({ timerDays = 0, timerHours = 0, timerMinutes = 0, timerSeconds = 0 }: CountDownProps) {
    return (
        <div className="timer-container">
            <div className="timer">
                <div className="clock flex text-center">
                    <div className="md:mr-[80px] mr-[25px]">
                        <h4 className='font-prata text-black md:text-[48px] text-[25px] relative after:content-[":"] md:after:text-[48px] after:text-[25px] after:absolute after:top-1/2 md:after:right-[-42.5px] after:right-[-15px] after:transform after:-translate-y-1/2'>
                            {timerDays}
                        </h4>
                        <span className="uppercase font-medium">天</span>
                    </div>
                    <div className="md:mr-[80px] mr-[25px]">
                        <h4 className='font-prata text-black md:text-[48px] text-[25px] relative after:content-[":"] md:after:text-[48px] after:text-[25px] after:absolute after:top-1/2 md:after:right-[-42.5px] after:right-[-15px] after:transform after:-translate-y-1/2'>
                            {timerHours}
                        </h4>
                        <span className="uppercase font-medium">時</span>
                    </div>
                    <div className="md:mr-[80px] mr-[25px]">
                        <h4 className='font-prata text-black md:text-[48px] text-[25px] relative after:content-[":"] md:after:text-[48px] after:text-[25px] after:absolute after:top-1/2 md:after:right-[-42.5px] after:right-[-15px] after:transform after:-translate-y-1/2'>
                            {timerMinutes}
                        </h4>
                        <span className="uppercase font-medium">分</span>
                    </div>
                    <div>
                        <h4 className="font-prata text-black md:text-[48px] text-[25px]">
                            {timerSeconds}
                        </h4>
                        <span className="uppercase font-medium">秒</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CountDown;
