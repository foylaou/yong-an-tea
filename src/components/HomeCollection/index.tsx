import { ReactNode } from 'react';

interface HomeCollectionProps {
    children: ReactNode;
}

function HomeCollection({ children }: HomeCollectionProps) {
    return (
        <div className="home-collection bg-white relative lg:mb-[515px] sm:mb-[745px]">
            {children}
        </div>
    );
}

export default HomeCollection;
