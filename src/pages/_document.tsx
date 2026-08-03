import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="zh-TW" className="scroll-smooth">
                <Head>
                    <link
                        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Mr+De+Haviland&family=Prata&family=Roboto:wght@100;300;400;500;700;900&display=swap"
                        rel="stylesheet"
                    />
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="icon" href="/favicon.png" type="image/png" />
                    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
                    <link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png" />
                    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                    <meta name="theme-color" content="#c67139" />
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
