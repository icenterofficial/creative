
import React from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, setIsOpen, containerRef }) => {
  const { language, setLanguage, languageName } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', flag: 'https://upload.wikimedia.org/wikipedia/commons/1/13/United-kingdom_flag_icon_round.svg' },
    { code: 'km', label: 'ខ្មែរ', flag: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg' },
    { code: 'fr', label: 'Français', flag: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg' },
    { code: 'ja', label: '日本語', flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg' },
    { code: 'ko', label: '한국어', flag: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg' },
    { code: 'de', label: 'Deutsch', flag: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg' },
    { code: 'zh-CN', label: '中文', flag: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg' },
    { code: 'es', label: 'Español', flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg' },
    { code: 'ar', label: 'العربية', flag: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg' },
  ];

  const currentFlag = languages.find(l => l.code === language)?.flag || languages[0].flag;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium text-gray-300 backdrop-blur-md"
      >
        <img src={currentFlag} alt={language} className="w-4 h-4 rounded-full object-cover shadow-sm" />
        <span className="hidden md:inline">{languageName}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1.5 z-[120] animate-scale-up origin-top-right">
          <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center gap-2 text-gray-500">
            <Globe size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Select Language</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
            {languages.map((lang) => (
              <button 
                key={lang.code} 
                onClick={() => { setLanguage(lang.code as any); setIsOpen(false); }} 
                className={`flex items-center justify-between w-full px-3 py-2.5 text-xs rounded-xl transition-colors font-khmer mb-0.5 ${
                  language === lang.code ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={lang.flag} className="w-4 h-4 rounded-full object-cover" />
                  <span>{lang.label}</span>
                </div>
                {language === lang.code && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
