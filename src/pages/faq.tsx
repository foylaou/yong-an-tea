import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import Faq from '../components/FAQ';
import FooterComps from '../components/FooterComps';

function FAQPage() {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="常見問題"
                item="首頁"
                itemPath="/"
                activeItem="常見問題"
            />
            <Faq />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default FAQPage;
