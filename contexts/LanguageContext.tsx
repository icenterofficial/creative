
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Extended language support
type Language = 'en' | 'km' | 'fr' | 'ja' | 'ko' | 'de' | 'zh-CN' | 'es' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, km: string) => string;
  languageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
const GOOGLE_LANGUAGES: Language[] = ['fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Helper to get cookie
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const setGoogleCookie = (lang: Language) => {
     // If it's a Google supported language (that we don't translate manually), set cookie
     if (GOOGLE_LANGUAGES.includes(lang)) {
         document.cookie = `googtrans=/en/${lang}; path=/;`;
     } else {
         // Clear cookie for EN/KM (Manual translation)
         document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
         document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
     }
  };

  // Helper: Update SEO Metadata
  const updateSEOMetadata = (lang: Language) => {
      if (lang === 'km') {
          document.title = "Ponloe Creative | ទទួលធ្វើវេបសាយ, កម្មវិធីទូរស័ព្ទ, និងរចនាប្លង់";
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
              metaDesc.setAttribute('content', 'ទទួលធ្វើវេបសាយ Mobile App រចនាក្រាហ្វិក និងប្លង់ស្ថាបត្យកម្ម ក្នុងតម្លៃសមរម្យ។ ក្រុមការងារជំនាញនៅភ្នំពេញ ផ្តល់ជូនដំណោះស្រាយល្អបំផុតសម្រាប់អាជីវកម្មរបស់អ្នក។');
          }
      } else {
          document.title = "Ponloe Creative | Web App, Design & Architecture Services in Cambodia";
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
              metaDesc.setAttribute('content', 'Leading creative agency in Phnom Penh offering Web Development, Mobile Apps, Architecture, and Graphic Design. We provide high-quality solutions for every budget.');
          }
      }
  };

  // INITIALIZATION
  useEffect(() => {
    // 1. Check URL Path first (e.g., /fr, /km)
    const path = window.location.pathname.split('/')[1] as Language;
    
    if (SUPPORTED_LANGUAGES.includes(path)) {
        setLanguageState(path);
        setGoogleCookie(path);
        updateSEOMetadata(path); // Update Title on Load
        // Ensure trailing slash exists if missing
        if (!window.location.pathname.endsWith('/')) {
             const hash = window.location.hash;
             window.history.replaceState(null, '', `/${path}/${hash}`);
        }
    } else {
        // If root "/" or invalid, default to 'en' or saved pref, then rewrite URL
        const savedLang = (localStorage.getItem('app_lang') as Language) || 'en';
        setLanguageState(savedLang);
        updateSEOMetadata(savedLang); // Update Title on Load
        
        // Rewrite URL to include lang with trailing slash without reloading
        const hash = window.location.hash;
        window.history.replaceState(null, '', `/${savedLang}/${hash}`);
        setGoogleCookie(savedLang);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    const prevLang = language;
    setLanguageState(newLang);
    localStorage.setItem('app_lang', newLang);
    updateSEOMetadata(newLang); // Update Title Immediately

    // Update URL with trailing slash
    const hash = window.location.hash;
    // Always format as /lang/#hash to maintain cleanliness
    window.history.pushState(null, '', `/${newLang}/${hash}`);

    const isPrevGoogle = GOOGLE_LANGUAGES.includes(prevLang);
    const isNewGoogle = GOOGLE_LANGUAGES.includes(newLang);

    // Handling Google Translate Logic
    if (isNewGoogle) {
        setGoogleCookie(newLang);
        // We need to reload to trigger the Google Script if we weren't already in a Google mode
        // OR if we are switching between Google modes (e.g. FR -> JA) to update the iframe
        setTimeout(() => window.location.reload(), 50);
    } else {
        // Switching to Manual (EN/KM)
        setGoogleCookie(newLang);
        if (isPrevGoogle) {
            // If we were in Google mode, we MUST reload to remove the iframe/DOM injections
            setTimeout(() => window.location.reload(), 50);
        }
        // If switching EN <-> KM, no reload needed, React handles it instantly
    }
  };

  // The translation function
  const t = (en: string, km: string) => {
    return language === 'km' ? km : en;
  };

  const languageNames: Record<Language, string> = {
    'en': 'English',
    'km': 'ខ្មែរ',
    'fr': 'Français',
    'ja': '日本語',
    'ko': '한국어',
    'de': 'Deutsch',
    'zh-CN': '中文',
    'es': 'Español',
    'ar': 'العربية'
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageName: languageNames[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
