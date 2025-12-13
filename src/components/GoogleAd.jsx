import React, { useEffect } from 'react';

const GoogleAd = ({ slot, style, format = 'auto', responsive = 'true' }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className="my-4 flex justify-center overflow-hidden">
            <ins
                className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client={import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID}
                data-ad-slot={slot || import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID_GLOBAL}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            ></ins>
        </div>
    );
};

export default GoogleAd;
