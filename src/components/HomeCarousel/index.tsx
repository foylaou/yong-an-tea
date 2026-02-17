import { ReactNode } from 'react';

interface HomeCarouselProps {
    children: ReactNode;
}

function HomeCarousel({ children }: HomeCarouselProps) {
    return (
        <div className="home-carousel bg-white relative lg:mb-[515px] sm:mb-[745px]">
            {children}
        </div>
    );
}

export default HomeCarousel;
