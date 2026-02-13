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

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from local storage or default to 'en'
  const [language, setLanguageState] = useState<Language>('en');

  // Helper to get cookie
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    const googTrans = getCookie('googtrans');
    if (googTrans) {
      // Extract target language from /en/fr -> fr
      const parts = googTrans.split('/');
      const targetLang = parts[parts.length - 1] as Language;
      if (['fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'].includes(targetLang)) {
        setLanguageState(targetLang);
      }
    } else {
        // If no google translate cookie, check local storage for 'km'
        const savedLang = localStorage.getItem('app_lang') as Language;
        if (savedLang === 'km') setLanguageState('km');
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    const currentIsGoogle = ['fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'].includes(language);
    const newIsGoogle = ['fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'].includes(newLang);
    const googTransCookie = getCookie('googtrans');

    // 1. SCENARIO: Switching between Manual Languages (EN <-> KM) AND Google is NOT active
    // This allows for INSTANT switching without reload
    if (!newIsGoogle && !googTransCookie) {
        setLanguageState(newLang);
        localStorage.setItem('app_lang', newLang);
        return; // Stop here, no reload needed!
    }

    // 2. SCENARIO: Switching TO or FROM a Google Language, OR cleaning up Google Cookie
    // We must update state and reload the page
    setLanguageState(newLang);
    localStorage.setItem('app_lang', newLang);

    if (!newIsGoogle) {
        // We are going back to EN or KM from a Google Lang
        // Clear cookies for path / and domain
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
        
        // Reload to remove Google's DOM injections
        setTimeout(() => window.location.reload(), 50);
    } else {
        // We are switching TO a Google Lang
        // Set Google Translate Cookie: /auto/target_lang or /en/target_lang
        document.cookie = `googtrans=/en/${newLang}; path=/;`;
        
        // Reload to trigger translation script
        setTimeout(() => window.location.reload(), 50);
    }
  };

  // The translation function
  // Logic: If current language is 'km', use the manual Khmer string.
  // For ALL other languages (including 'en'), use the English string.
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