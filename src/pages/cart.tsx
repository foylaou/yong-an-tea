import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import CartPageComps from '../components/CartPageComps';
import FooterComps from '../components/FooterComps';

function CartPage() {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="購物車"
                item="首頁"
                itemPath="/"
                activeItem="購物車"
            />
            <CartPageComps />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default CartPage;
