import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en" className="scroll-smooth">
                <Head>
                    <link
                        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Mr+De+Haviland&family=Prata&family=Roboto:wght@100;300;400;500;700;900&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                    <div id="quickview-root" />
                    <div id="notification-root" />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
