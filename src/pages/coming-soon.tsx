import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import ComingSoon from '../components/ComingSoon';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface ComingSoonPageProps {
    comingSoonItems: MarkdownItem[];
}

function ComingSoonPage({ comingSoonItems }: ComingSoonPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="即將推出"
                item="首頁"
                itemPath="/"
                activeItem="即將推出"
            />
            <ComingSoon comingSoonItems={comingSoonItems} />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const comingSoonItems = getAllItems('coming-soon');

    return {
        props: {
            comingSoonItems,
        },
    };
};

export default ComingSoonPage;
