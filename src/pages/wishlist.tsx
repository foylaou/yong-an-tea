import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import WishlistPageComps from '../components/WishlistPageComps';
import FooterComps from '../components/FooterComps';

function WishlistPage() {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="願望清單"
                item="首頁"
                itemPath="/"
                activeItem="願望清單"
            />
            <WishlistPageComps />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default WishlistPage;
