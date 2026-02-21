import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowUpRight, ChevronDown, Check, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { smoothScrollTo } from '../utils/scroll';
import { hapticLanguageChange, hapticTap } from '../utils/haptic';
import PonloeLogo from './PonloeLogo';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const { language, setLanguage, t, languageName } = useLanguage();

  const navRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const langMenuRef = useRef<HTMLDivElement>(null);
  
  // CRITICAL: Prevent IntersectionObserver from triggering during manual click scrolls
  const isManualScrolling = useRef(false);
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navLinks = [
    { name: t('Home', 'ទំព័រដើម'), href: '#home' },
    { name: t('Services', 'សេវាកម្ម'), href: '#services' },
    { name: t('Estimator', 'គណនាតម្លៃ'), href: '#estimator' },
    { name: t('Work', 'ស្នាដៃ'), href: '#portfolio' },
    { name: t('Team', 'ក្រុមការងារ'), href: '#team' },
    { name: t('Insights', 'ចំណេះដឹង'), href: '#insights' },
  ];

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setIsLangMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    const observer = new IntersectionObserver((entries) => {
      if (isManualScrolling.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          const newSection = entry.target.id;
          setActiveSection(newSection);
          
          // Only update URL hash on Desktop/Tablet (width > 768px) to prevent scroll lag on mobile
          const isMobile = window.innerWidth <= 768;
          const currentHash = window.location.hash;
          
          if (!isMobile && !currentHash.includes('/') && currentHash !== '#admin') {
              window.history.replaceState(null, '', `#${newSection}`);
          }
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    document.querySelectorAll('section').forEach(section => {
      if (section.id) observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const activeIndex = navLinks.findIndex(link => link.href.substring(1) === activeSection);
    if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
        const { offsetLeft, offsetWidth } = itemsRef.current[activeIndex]!;
        setIndicatorStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection, language]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    hapticTap(); // Add haptic feedback on navigation
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    
    if (element) {
      isManualScrolling.current = true;
      setActiveSection(targetId);
      
      try {
        window.history.pushState(null, '', href);
      } catch (e) {
        window.location.hash = href;
      }

      const offset = 80;
      const pos = element.getBoundingClientRect().top + window.scrollY - offset;
      
      smoothScrollTo(pos, 1000);
      
      setTimeout(() => {
          isManualScrolling.current = false;
      }, 1100); 

      setIsMenuOpen(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    hapticLanguageChange(); // Strong haptic feedback for language change
    setLanguage(langCode as any);
    setIsLangMenuOpen(false);
  };

  const toggleMenu = () => {
    hapticTap(); // Haptic feedback on menu toggle
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300 flex justify-center px-4">
        <div className={`flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 rounded-full border transition-all duration-300 w-full max-w-6xl ${isScrolled ? 'bg-gray-950/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-indigo-500/10' : 'bg-white/5 backdrop-blur-md border-white/5'}`}>
          <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="flex items-center gap-2 group relative z-50">
            <PonloeLogo size={32} />
            <span className="text-lg md:text-xl font-bold font-khmer tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              ponloe<span className="text-gray-500 font-normal">.creative</span>
            </span>
          </a>

          <nav ref={navRef} className="hidden lg:flex items-center relative bg-white/5 p-1.5 rounded-full border border-white/5">
            <div className="absolute top-1.5 bottom-1.5 rounded-full bg-white/10 transition-all duration-500 ease-out" style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px`, opacity: indicatorStyle.opacity }} />
            {navLinks.map((link, index) => (
              <a key={link.name} href={link.href} ref={(el) => { itemsRef.current[index] = el }} onClick={(e) => scrollToSection(e, link.href)} className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium font-khmer transition-colors duration-300 ${activeSection === link.href.substring(1) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>{link.name}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 relative z-50">
             <div className="relative" ref={langMenuRef}>
                 <button 
                   onClick={() => {
                     hapticTap();
                     setIsLangMenuOpen(!isLangMenuOpen);
                   }}
                   className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs md:text-sm font-medium text-gray-300 hover:text-white"
                 >
                    <img src={currentFlag} alt={language} className="w-4 h-4 md:w-5 md:h-5 rounded-full object-cover" />
                    <span className="uppercase hidden md:inline">{languageName}</span>
                    <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isLangMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1.5 animate-scale-up origin-top-right">
                        <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center gap-2 text-gray-500">
                          <Globe size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Select Language</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                          {languages.map((lang) => (
                              <button 
                                key={lang.code} 
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex items-center justify-between w-full px-4 py-2 text-xs md:text-sm rounded-xl transition-colors font-khmer ${language === lang.code ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                              >
                                  <span className="flex items-center gap-3"><img src={lang.flag} alt={lang.label} className="w-5 h-5 rounded-full object-cover" /><span>{lang.label}</span></span>
                                  {language === lang.code && <Check size={14} />}
                              </button>
                          ))}
                        </div>
                     </div>
                 )}
             </div>

             <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="hidden sm:flex group px-5 py-2.5 rounded-full bg-white text-gray-950 font-bold text-sm hover:scale-105 transition-all duration-300 items-center gap-2 font-khmer">
              {t("Get a Quote", "ស្នើសុំតម្លៃ")} <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
            </a>

            <button onClick={toggleMenu} className="lg:hidden text-white p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 bg-gray-950 z-40 flex items-center justify-center transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-sm px-6">
          {navLinks.map((link, idx) => (
            <a key={link.name} href={link.href} onClick={(e) => scrollToSection(e, link.href)} className={`text-3xl font-bold font-khmer text-white hover:text-indigo-400 transition-all transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${idx * 100}ms` }}>{link.name}</a>
          ))}
          <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className={`w-full text-center px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg font-khmer shadow-xl transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '300ms' }}>{t("Start a Project", "ចាប់ផ្តើមគម្រោង")}</a>
        </div>
      </div>
    </>
  );
};

export default Header;
