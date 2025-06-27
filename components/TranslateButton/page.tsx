'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentLanguage, setLanguageWithCookie, ensureTranslation } from '../../app/utils/googleTranslateHelper';

// Define TypeScript interfaces
interface LanguageData {
  code: string;
  name: string;
  flag: string;
  countryCode?: string;
}

type LanguageMappingType = {
  [countryCode: string]: LanguageData;
};

// Sample language mapping
const languageMapping: LanguageMappingType = {
   'US': { code: 'en', name: 'English', flag: '🇺🇸' },
  'DK': { code: 'da', name: 'Danish', flag: '🇩🇰' },
  'AE': { code: 'ar', name: 'Arabic', flag: '🇦🇪' },
  'ES': { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  'FR': { code: 'fr', name: 'French', flag: '🇫🇷' },
  'DE': { code: 'de', name: 'German', flag: '🇩🇪' },
  'IT': { code: 'it', name: 'Italian', flag: '🇮🇹' },
  'JP': { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  'KR': { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  'CN': { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  'TW': { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  'PT': { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  'RU': { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  'IN': { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
};

// Process language data for dropdown - remove duplicates based on language name
const processLanguagesForDropdown = (): LanguageData[] => {
  // Create a map to store unique languages based on language code
  const uniqueLanguages = new Map<string, LanguageData>();
  
  // Process each language entry
  Object.entries(languageMapping).forEach(([countryCode, language]) => {
    // Special case for English - always use US flag
    if (language.code === 'en') {
      language.flag = '🇺🇸';
      // Store country code for reference
      language.countryCode = countryCode;
      
      // Set English from US as the standard English
      if (countryCode === 'US') {
        uniqueLanguages.set(language.code, language);
      }
    } 
    // For all other languages
    else if (!uniqueLanguages.has(language.code)) {
      // Store country code for reference
      language.countryCode = countryCode;
      uniqueLanguages.set(language.code, language);
    }
  });
  
  // Convert map back to array and sort alphabetically by language name
  return Array.from(uniqueLanguages.values())
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get processed languages list
const allUniqueLanguages = processLanguagesForDropdown();

const TranslateButton = () => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
const [selectedLanguage, setSelectedLanguage] = useState<LanguageData>(() => {
  return languageMapping['DK'] || { code: 'da', name: 'Danish', flag: '🇩🇰', countryCode: 'DK' };
});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLanguages, setFilteredLanguages] = useState<LanguageData[]>(allUniqueLanguages);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isMainPage, setIsMainPage] = useState(false);

   useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMain = window.location.pathname === '/' || window.location.pathname === '';
      setIsMainPage(isMain);
    }
  }, []);

  
  // Initialize selected language from cookies or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clean up URL hash if present
      if (window.location.hash.includes('googtrans')) {
        // Remove hash without page refresh
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      // Get current language
      const currentLangCode = getCurrentLanguage();
      if (currentLangCode) {
        const langObj = allUniqueLanguages.find(lang => lang.code === currentLangCode);
        if (langObj) {
          setSelectedLanguage(langObj);
        }
      }
      
      // Ensure translation is applied
      ensureTranslation();
    }
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter languages based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLanguages(allUniqueLanguages);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allUniqueLanguages.filter(lang => 
        lang.name.toLowerCase().includes(query) || 
        lang.code.toLowerCase().includes(query)
      );
      setFilteredLanguages(filtered);
    }
  }, [searchQuery]);

  // Handle language selection
  const translatePage = (language: LanguageData) => {
    // Update the selected language in state
    setSelectedLanguage(language);
    
    // Use the cookie-based approach from our helper
    setLanguageWithCookie(language.code);
    
    // Close dropdown and clear search
    setDropdownOpen(false);
    setSearchQuery('');
    
    // Remove hash from URL if present (without page refresh)
    if (window.location.hash.includes('googtrans')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    // refresh website
    window.location.reload();
  };

  // This ensures that Google Translate doesn't translate our dropdown text
  const preventTranslation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.setAttribute('translate', 'no');
    e.currentTarget.classList.add('notranslate');
  };


   if (!isMainPage) {
    return null;
  }
  return (
    <div className="relative notranslate" translate="no" ref={dropdownRef} onClick={preventTranslation}>
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="font-medium text-slate-900 hover:text-orange-600 px-4 py-3 flex items-center transition duration-150 ease-in-out relative group"
        aria-label="Select language"
      >
        <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-600 group-hover:after:w-full after:transition-all after:duration-300 flex items-center">
          <span className="mr-1 opacity-80">{selectedLanguage.flag}</span>
          <span className="mr-1">{selectedLanguage.code.toUpperCase()}</span>
        </span>
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-[28rem] overflow-y-auto notranslate mt-5" translate="no">
          <div className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 flex justify-between items-center">
              <span>Select language</span>
              <span className="text-xs text-gray-400">{filteredLanguages.length} languages</span>
            </div>

            {/* Search input */}
            <div className="px-3 py-2 border-b border-gray-100">
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Language list */}
            <div className="max-h-80 overflow-y-auto">
              {filteredLanguages.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500 italic">
                  No languages found
                </div>
              ) : (
                filteredLanguages.map((language) => (
                  <button 
                    key={language.code}
                    onClick={() => translatePage(language)}
                    className={`px-4 py-2 text-sm w-full text-left flex items-center ${
                      selectedLanguage.code === language.code 
                        ? 'bg-orange-50 text-orange-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2 opacity-70">{language.flag}</span> 
                    <span>{language.name}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      {language.code}
                    </span>
                    {selectedLanguage.code === language.code && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslateButton;