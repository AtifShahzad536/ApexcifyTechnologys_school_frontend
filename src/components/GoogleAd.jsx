import React, { useEffect } from 'react';

const GoogleAd = ({ slot, style, format = 'auto', responsive = 'true', className }) => {
    useEffect(() => {
        try {
            const ads = document.getElementsByClassName("adsbygoogle");
            let hasUnfilled = false;
            // Check if there are any ads that are NOT filled
            for (let i = 0; i < ads.length; i++) {
                if (!ads[i].hasAttribute('data-ad-status')) {
                    hasUnfilled = true;
                    break;
                }
            }

            if (hasUnfilled) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            // Suppress common benign AdSense errors
            const message = e.message || '';
            if (!message.includes('already have ads') && !message.includes('No slot size')) {
                console.error('AdSense error:', e);
            }
        }
    }, []);

    return (
        <div className={`flex justify-center overflow-hidden w-full z-50 ${className || 'my-1'}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', ...style }}
                data-ad-client={import.meta.env.VITE_GOOGLE_ADSENSE_PUBLISHER_ID}
                data-ad-slot={slot || import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID_GLOBAL}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            ></ins>
        </div>
    );
};

export default GoogleAd;
