'use client';

import { useSettingsStore } from '../../store/settings/settings-slice';

const DEFAULT_MAP_URL =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648718453!2d-73.98656668459375!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1629794729607!5m2!1sen!2sus';

function GoogleMap() {
    const mapUrl = useSettingsStore((s) => s.map_embed_url) || DEFAULT_MAP_URL;

    return (
        <div className="google-map-area">
            <iframe
                title="Google Map"
                className="w-full h-[400px] border-0"
                src={mapUrl}
                allowFullScreen
                loading="lazy"
            />
        </div>
    );
}

export default GoogleMap;
