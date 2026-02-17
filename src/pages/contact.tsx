import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import ContactUs from '../components/Contact';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface ContactPageProps {
    headerItems: MarkdownItem[];
    contactItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function ContactPage({ headerItems, contactItems, footerItems }: ContactPageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="聯絡我們"
                item="首頁"
                itemPath="/"
                activeItem="聯絡我們"
            />
            <ContactUs contactItems={contactItems} />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const contactItems = getAllItems('contact');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            contactItems,
            footerItems,
        },
    };
};

export default ContactPage;
