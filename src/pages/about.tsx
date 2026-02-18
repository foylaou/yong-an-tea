import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import AboutUs from '../components/AboutUs';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface AboutPageProps {
    aboutItems: MarkdownItem[];
}

function AboutPage({ aboutItems }: AboutPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
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
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const aboutItems = getAllItems('about');

    return {
        props: {
            aboutItems,
        },
    };
};

export default AboutPage;
