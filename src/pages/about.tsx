import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import AboutUs from '../components/AboutUs';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface AboutPageProps {
    headerItems: MarkdownItem[];
    aboutItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function AboutPage({ headerItems, aboutItems, footerItems }: AboutPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="關於我們"
                item="首頁"
                itemPath="/"
                activeItem="關於我們"
            />
            <AboutUs aboutItems={aboutItems} />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const aboutItems = getAllItems('about');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            aboutItems,
            footerItems,
        },
    };
};

export default AboutPage;
