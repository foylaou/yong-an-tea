import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import ComingSoon from '../components/ComingSoon';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface ComingSoonPageProps {
    headerItems: MarkdownItem[];
    comingSoonItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function ComingSoonPage({ headerItems, comingSoonItems, footerItems }: ComingSoonPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
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
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const comingSoonItems = getAllItems('coming-soon');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            comingSoonItems,
            footerItems,
        },
    };
};

export default ComingSoonPage;
