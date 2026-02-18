import type { GetStaticProps } from 'next';
import type { MarkdownItem } from '../types';
import HeaderOne from '../components/HeaderComps';
import Error404 from '../components/Error404';
import FooterComps from '../components/FooterComps';
import { getAllItems } from '../lib/ItemsUtil';

interface Error404PageProps {
    errorItems: MarkdownItem[];
}

function Error404Page({ errorItems }: Error404PageProps) {
    return (
        <>
            <HeaderOne headerContainer="container" />
            <Error404 errorItems={errorItems} />
            <FooterComps
                footerContainer="container"
            />
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const errorItems = getAllItems('error404');

    return {
        props: {
            errorItems,
        },
    };
};

export default Error404Page;
