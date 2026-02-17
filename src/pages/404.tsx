import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Error404 from '../components/Error404';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface Error404PageProps {
    headerItems: MarkdownItem[];
    errorItems: MarkdownItem[];
    footerItems: MarkdownItem[];
}

function Error404Page({ headerItems, errorItems, footerItems }: Error404PageProps) {
    return (
        <>
            <HeaderOne headerItems={headerItems} headerContainer="container" />
            <Error404 errorItems={errorItems} />
            <FooterComps
                footerContainer="container"
                footerItems={footerItems}
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const headerItems = getAllItems('header');
    const errorItems = getAllItems('error404');
    const footerItems = getAllItems('footer');

    return {
        props: {
            headerItems,
            errorItems,
            footerItems,
        },
    };
};

export default Error404Page;
