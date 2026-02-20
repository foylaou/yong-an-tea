import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import AboutUs from '../components/AboutUs';
import FooterComps from '../components/FooterComps';

function AboutPage() {
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
            <AboutUs />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default AboutPage;
