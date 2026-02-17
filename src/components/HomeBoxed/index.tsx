import { ReactNode } from 'react';

interface HomeBoxedProps {
    children: ReactNode;
}

function HomeBoxed({ children }: HomeBoxedProps) {
    return (
        <div className="homebox bg-[#f4f5f7]">
            <div className="homebox-inner bg-white xxl:w-[1330px] xl:w-[1140px] m-auto">
                {children}
            </div>
        </div>
    );
}

export default HomeBoxed;
