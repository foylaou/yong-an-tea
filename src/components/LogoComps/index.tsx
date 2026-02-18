import Link from 'next/link';
import { useSettingsStore } from '../../store/settings/settings-slice';

interface LogoCompsProps {
    headerLogoCName: string;
    logoPath: string;
}

function LogoComps({ headerLogoCName, logoPath }: LogoCompsProps) {
    const loaded = useSettingsStore((s) => s.loaded);
    const logoSrc = useSettingsStore((s) => s.logo_url);

    return (
        <div className={`${headerLogoCName}`}>
            <Link href={logoPath} className="block">
                <img
                    src={logoSrc}
                    alt="網站標誌"
                    width={120}
                    height={30}
                    className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            </Link>
        </div>
    );
}

export default LogoComps;
