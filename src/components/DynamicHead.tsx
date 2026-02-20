import Head from 'next/head';
import { useSettingsStore } from '../store/settings/settings-slice';

const SITE_URL = 'https://yong-an-tea.vercel.app';

function DynamicHead() {
    const siteName = useSettingsStore((s) => s.site_name);
    const siteDescription = useSettingsStore((s) => s.site_description);
    const faviconUrl = useSettingsStore((s) => s.favicon_url);
    const logoUrl = useSettingsStore((s) => s.logo_url);

    const title = siteName || '永安茶園';
    const description = siteDescription || '永安茶園 — 嚴選台灣好茶，產地直送，品味自然甘醇。';

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={title} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={SITE_URL} />
            {logoUrl && <meta property="og:image" content={logoUrl} />}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {logoUrl && <meta name="twitter:image" content={logoUrl} />}
            {faviconUrl && (
                <link rel="shortcut icon" href={faviconUrl} />
            )}
        </Head>
    );
}

export default DynamicHead;
