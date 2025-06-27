declare global {
  interface Window {
    googleTranslateInitialized?: boolean;
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function getCurrentLanguage(): string {
  const match = document.cookie.match(/(^|;)\s*googtrans=([^;]+)/);
  if (match) {
    const langCode = match[2].split('/')[2];
    return langCode || 'en';
  }
  return localStorage.getItem('selectedLanguageCode') || 'en';
}


export function setLanguageWithCookie(langCode: string): boolean {
  if (!langCode) return false;

  try {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    const hostname = window.location.hostname;

    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${hostname}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    localStorage.setItem('selectedLanguageCode', langCode);

    if (window.google?.translate) {
      applyTranslationWithoutRefresh(langCode);
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.translate) {
          clearInterval(checkInterval);
          applyTranslationWithoutRefresh(langCode);
        }
      }, 200);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    return true;
  } catch (error) {
    console.error('Error setting language cookie:', error);
    return false;
  }
}

function applyTranslationWithoutRefresh(langCode: string): void {
  try {
    const googleTranslateElement = document.getElementById('google_translate_element');
    if (googleTranslateElement) {
      const selectors = [
        '.goog-te-combo',
        'select.goog-te-combo',
        '[id*="goog-te-combo"]',
        'select',
        'select[class*="goog"]',
      ];

      let foundSelect = false;

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element instanceof HTMLSelectElement) {
            try {
              element.value = langCode;
              element.dispatchEvent(new Event('change'));
              foundSelect = true;
            } catch (e) {
              console.error('Error changing select value:', e);
            }
          }
        });
        if (foundSelect) break;
      }

      if (!foundSelect && window.google?.translate?.TranslateElement) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: langCode,
              autoDisplay: true,
              multilanguagePage: true,
            },
            'google_translate_element'
          );
        } catch (e) {
          console.error('Error using Google TranslateElement API:', e);
        }

        try {
          document.body.classList.add('translated-' + langCode);
          const googleCombo = document.querySelector('.goog-te-combo');
          if (googleCombo instanceof HTMLSelectElement) {
            googleCombo.value = langCode;
            googleCombo.dispatchEvent(new Event('change'));
          }
        } catch (e) {
          console.error('Error with direct content manipulation:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error in applyTranslationWithoutRefresh:', error);
  }
}

export function initGoogleTranslate(): void {
  if (window.google?.translate) return;

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      'google_translate_element'
    );

    hideGoogleTranslateBar();

    const storedLang = localStorage.getItem('selectedLanguageCode');
    if (storedLang && storedLang !== 'en') {
      setLanguageWithCookie(storedLang);
    } else if (!storedLang) {
      setLanguageWithCookie('en');
    }
  };

  function hideGoogleTranslateBar() {
    const style = document.createElement('style');
    style.textContent = `
      .VIpgJd-ZVi9od-ORHb-OEVmcd,
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
      .goog-te-banner-frame,
      .skiptranslate {
        display: none !important;
        visibility: hidden !important;
      }
      body {
        top: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }
}

export function ensureTranslation(): void {
  const currentLang = getCurrentLanguage();
  if (currentLang !== 'en') {
    setTimeout(() => {
      applyTranslationWithoutRefresh(currentLang);
    }, 200);
  }
}
