import HeaderOne from '../components/HeaderComps';
import Breadcrumb from '../components/Breadcrumb';
import AuthForm from '../components/Auth/AuthForm';
import FooterComps from '../components/FooterComps';

function AuthPage() {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Breadcrumb
                breadcrumbContainer="container"
                title="登入"
                item="首頁"
                itemPath="/"
                activeItem="登入"
            />
            <AuthForm />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default AuthPage;
