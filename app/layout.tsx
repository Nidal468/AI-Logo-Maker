'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { initGoogleTranslate, ensureTranslation } from '@/app/utils/googleTranslateHelper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initGoogleTranslate();

    if (typeof window !== 'undefined' && window.location.hash.includes('googtrans')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const timer = setTimeout(() => {
      ensureTranslation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const googleTranslateInit = `
    function googleTranslateElementInit() {
      if (!window.googleTranslateInitialized) {
        window.googleTranslateInitialized = true;
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: 'af,sq,ar,hy,az,eu,be,bn,bs,bg,ca,ceb,ny,zh-CN,zh-TW,co,hr,cs,da,nl,en,eo,et,tl,fi,fr,fy,gl,ka,de,el,gu,ht,ha,haw,iw,hi,hmn,hu,is,ig,id,ga,it,ja,jw,kn,kk,km,ko,ku,ky,lo,la,lv,lt,lb,mk,mg,ms,ml,mt,mi,mr,mn,my,ne,no,ps,fa,pl,pt,pa,ro,ru,sm,gd,sr,st,sn,sd,si,sk,sl,so,es,su,sw,sv,tg,ta,te,th,tr,uk,ur,uz,vi,cy,xh,yi,yo,zu',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');

        const hideElements = () => {
          const style = document.createElement('style');
          style.textContent = \`
            .VIpgJd-ZVi9od-ORHb-OEVmcd,
            .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
            .goog-te-banner-frame,
            .skiptranslate,
            #goog-gt-tt {
              display: none !important;
              visibility: hidden !important;
            }
            body {
              top: 0px !important;
            }
            div#google_translate_element div.skiptranslate {
              display: none !important;
              visibility: hidden !important;
            }
          \`;
          document.head.appendChild(style);
        };

        hideElements();
        setTimeout(hideElements, 1000);
      }
    }
  `;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Freelance Marketplace</title>
        <meta
          name="description"
          content="Connect with skilled freelancers to get your projects done quickly and efficiently."
        />

        <Script id="clear-hash-early" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('googtrans')) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
          `}
        </Script>

        <Script id="google-translate-init-func" strategy="beforeInteractive">
          {googleTranslateInit}
        </Script>

        <Script
          id="google-translate-script-api"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <div
          id="google_translate_element"
          className="fixed -z-50 top-0 left-0 opacity-0 pointer-events-none"
          style={{ display: 'none' }}
        />

        <AuthProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </body>
    </html>
  );
}
