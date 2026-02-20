import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import ContactUs from '../components/Contact';
import FooterComps from '../components/FooterComps';

function ContactPage() {
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
            <ContactUs />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default ContactPage;
