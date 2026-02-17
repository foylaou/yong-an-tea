import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import Faq from '../components/FAQ';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface FAQPageProps {
    headerItems: MarkdownItem[];
    faqItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function FAQPage({ headerItems, faqItems, footerItems }: FAQPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="常見問題"
                item="首頁"
                itemPath="/"
                activeItem="常見問題"
            />
            <Faq
                faqItems={faqItems}
                title="常見問題"
                desc="以下是我們最常被詢問的問題，希望能幫助您找到所需的答案。"
            />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const faqItems = getAllItems('faq');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            faqItems,
            footerItems,
        },
    };
};

export default FAQPage;
