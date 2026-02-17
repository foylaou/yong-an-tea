import Link from 'next/link';
import { MarkdownItem } from '../../types';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface LogoCompsProps {
    headerItems: MarkdownItem[];
    headerLogoCName: string;
    logoPath: string;
}

function LogoComps({ headerItems, headerLogoCName, logoPath }: LogoCompsProps) {
    const loaded = useSettingsStore((s) => s.loaded);
    const settingsLogoUrl = useSettingsStore((s) => s.logo_url);
    const logoSrc = settingsLogoUrl || headerItems[0]?.headerLogo[0]?.darkLogo;
    const logoAlt = headerItems[0]?.headerLogo[0]?.darkLogoAlt || '網站標誌';

    return (
        <div className={`${headerLogoCName}`}>
            <Link href={logoPath} className="block">
                <img
                    src={logoSrc}
                    alt={logoAlt}
                    width={120}
                    height={30}
                    className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            </Link>
        </div>
    );
}

export default LogoComps;
