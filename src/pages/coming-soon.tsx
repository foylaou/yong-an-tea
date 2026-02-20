import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import ComingSoon from '../components/ComingSoon';
import FooterComps from '../components/FooterComps';

function ComingSoonPage() {
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
            <ComingSoon />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default ComingSoonPage;
