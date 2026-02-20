import HeaderOne from '../components/HeaderComps';
import Error404 from '../components/Error404';
import FooterComps from '../components/FooterComps';

function Error404Page() {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Error404 />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export default Error404Page;
