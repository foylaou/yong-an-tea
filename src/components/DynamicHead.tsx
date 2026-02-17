import Head from 'next/head';
import { useSettingsStore } from '../store/settings/settings-slice';

function DynamicHead() {
    const siteName = useSettingsStore((s) => s.site_name);
    const siteDescription = useSettingsStore((s) => s.site_description);
    const faviconUrl = useSettingsStore((s) => s.favicon_url);

    return (
        <Head>
            <title>{siteName || ''}</title>
            {siteDescription && (
                <meta name="description" content={siteDescription} />
            )}
            {faviconUrl && (
                <link rel="shortcut icon" href={faviconUrl} />
            )}
        </Head>
    );
}

export default DynamicHead;
