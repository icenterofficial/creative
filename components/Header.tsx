
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Check, ArrowUpRight, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { smoothScrollTo } from '../../utils/scroll';
import PonloeLogo from '../PonloeLogo';

const Header: React.FC = () => {
  const { language, setLanguage, t, languageName } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const navLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navLinks = [
    { name: t('Home', 'ទំព័រដើម'), href: '#home' },
    { name: t('Services', 'សេវាកម្ម'), href: '#services' },
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
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      if (isManualScrolling.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          const id = entry.target.id;
          setActiveSection(id);
          if (window.location.hash !== `#${id}`) {
            window.history.replaceState(null, '', `#${id}`);
          }
        }
      });
    }, observerOptions);

    navLinks.forEach(link => {
      const el = document.getElementById(link.href.substring(1));
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, [language]);

  useEffect(() => {
    const activeIndex = navLinks.findIndex(link => link.href.substring(1) === activeSection);
    const target = navLinksRef.current[activeIndex !== -1 ? activeIndex : 0];
    if (target) {
      setIndicatorStyle({
        left: target.offsetLeft,
        width: target.offsetWidth,
        opacity: 1
      });
    }
  }, [activeSection, language]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    
    if (element) {
      isManualScrolling.current = true;
      setActiveSection(targetId);
      setIsMenuOpen(false);

      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      
      smoothScrollTo(offsetPosition, 1000);
      window.history.pushState(null, '', href);
      
      setTimeout(() => { isManualScrolling.current = false; }, 1100); 
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pt-6 px-4 pointer-events-none">
        <div className={`mx-auto max-w-7xl w-full flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 rounded-full border transition-all duration-500 pointer-events-auto ${
          isScrolled 
          ? 'bg-gray-950/80 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
          : 'bg-white/5 backdrop-blur-md border-white/5'
        }`}>
          
          <div className="flex items-center gap-8">
            {/* NEW LOGO COMPONENT */}
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="flex items-center gap-2 group relative z-[110]">
              <PonloeLogo size={36} />
              <span className="text-lg md:text-xl font-bold font-khmer tracking-tight text-white">
                ponloe<span className="text-gray-500 font-normal">.creative</span>
              </span>
            </a>

            <nav className="hidden lg:flex items-center relative bg-white/5 p-1 rounded-full border border-white/5">
              <div 
                className="absolute top-1 bottom-1 rounded-full bg-indigo-600/20 border border-indigo-500/20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" 
                style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px`, opacity: indicatorStyle.opacity }} 
              />
              {navLinks.map((link, index) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  ref={(el) => { navLinksRef.current[index] = el }} 
                  onClick={(e) => scrollToSection(e, link.href)} 
                  className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium font-khmer transition-colors duration-300 ${
                    activeSection === link.href.substring(1) ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative z-[110]">
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium text-gray-300"
              >
                <img src={currentFlag} alt={language} className="w-4 h-4 rounded-full object-cover shadow-sm" />
                <span className="hidden md:inline">{languageName}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1.5 z-[120] animate-scale-up origin-top-right">
                  <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center gap-2 text-gray-500">
                    <Globe size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select Language</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                    {languages.map((lang) => (
                      <button 
                        key={lang.code} 
                        onClick={() => { setLanguage(lang.code as any); setIsLangMenuOpen(false); }} 
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

            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, '#contact')}
              className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-white text-gray-950 text-xs font-bold font-khmer hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95"
            >
              {t('Get a Quote', 'ស្នើសុំតម្លៃ')}
              <ArrowUpRight size={14} />
            </a>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white p-2 rounded-full hover:bg-white/5 transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 bg-gray-950 z-[150] flex flex-col items-center justify-center transition-all duration-500 ${
        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
         <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-4 rounded-full bg-white/5 text-white border border-white/10"><X size={28} /></button>
         <nav className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
          {navLinks.map((link, idx) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => scrollToSection(e, link.href)} 
              className={`text-3xl font-bold font-khmer text-white hover:text-indigo-400 transition-all transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} 
              style={{ transitionDelay: `${idx * 70}ms` }}
            >
              {link.name}
            </a>
          ))}
          <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="mt-8 px-10 py-4 rounded-full bg-indigo-600 text-white font-bold font-khmer text-lg">{t('Get Started', 'ចាប់ផ្តើម')}</a>
        </nav>
      </div>
    </>
  );
};

export default Header;
