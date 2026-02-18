import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import ContactUs from '../components/Contact';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface ContactPageProps {
    contactItems: MarkdownItem[];
}

function ContactPage({ contactItems }: ContactPageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
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
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const contactItems = getAllItems('contact');

    return {
        props: {
            contactItems,
        },
    };
};

export default ContactPage;
