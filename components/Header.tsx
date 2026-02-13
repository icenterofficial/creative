import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowUpRight, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { smoothScrollTo } from '../utils/scroll';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Language Menu States
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);
  
  const { language, setLanguage, t, languageName } = useLanguage();

  // Refs for the gliding animation
  const navRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);
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
    { code: 'fr', label: 'Français', flag: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Franceroundflag.svg' },
    { code: 'ja', label: '日本語', flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg' },
    { code: 'ko', label: '한국어', flag: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg' },
    { code: 'zh-CN', label: '中文', flag: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Circle_Flag_of_the_People%27s_Republic_of_China.svg' },
    { code: 'de', label: 'Deutsch', flag: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg' },
    { code: 'es', label: 'Español', flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg' },
    { code: 'ar', label: 'العربية', flag: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Flag_of_Saudi_Arabia_%28type_2%29.svg' },
  ];

  const currentFlag = languages.find(l => l.code === language)?.flag || languages[0].flag;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
    };

    // Close lang menu on click outside
    const handleClickOutside = (event: MouseEvent) => {
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
            setIsLangMenuOpen(false);
        }
        if (mobileLangMenuRef.current && !mobileLangMenuRef.current.contains(event.target as Node)) {
            setIsMobileLangMenuOpen(false);
        }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Intersection Observer for Active State & URL Hash update
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          const newSection = entry.target.id;
          setActiveSection(newSection);
          
          // Update URL Hash without scrolling ONLY if not in a deep link (modal)
          // We check if the current hash contains a '/' which implies a modal is open (e.g. #insights/1)
          if (history.pushState && !window.location.hash.includes('/')) {
              if (window.location.hash !== `#${newSection}`) {
                 window.history.replaceState(null, '', `#${newSection}`);
              }
          }
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    document.querySelectorAll('section').forEach(section => {
      if (section.id) {
         observer.observe(section);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, []);

  // Update gliding pill position when activeSection changes
  useEffect(() => {
    const activeIndex = navLinks.findIndex(link => link.href.substring(1) === activeSection);
    
    if (activeIndex !== -1 && itemsRef.current[activeIndex] && navRef.current) {
        const currentEl = itemsRef.current[activeIndex];
        if (currentEl) {
            const { offsetLeft, offsetWidth } = currentEl;
            setIndicatorStyle({
                left: offsetLeft,
                width: offsetWidth,
                opacity: 1
            });
        }
    } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection, language]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      setActiveSection(href.substring(1));
      
      // Update URL immediately on click
      window.history.pushState(null, '', href);

      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      smoothScrollTo(offsetPosition, 1000);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-6 left-0 right-0 z-50 transition-all duration-300 flex justify-center px-4`}
      >
        <div className={`
          flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-300 w-full max-w-6xl
          ${isScrolled 
            ? 'bg-gray-950/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-indigo-500/10' 
            : 'bg-transparent border-transparent'
          }
        `}>
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group relative z-50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
               <div className="w-full h-full bg-gray-950 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">P</span>
               </div>
            </div>
            <span className="text-xl font-bold font-khmer tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              <span className="lg:hidden">p</span>
              <span className="hidden lg:inline">ponloe</span>
              <span className="text-gray-500 font-normal">.creative</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav 
            ref={navRef} 
            className="hidden md:flex items-center relative bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-sm"
          >
            <div 
                className="absolute top-1.5 bottom-1.5 rounded-full bg-white/10 border border-white/5 shadow-inner transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{ 
                    left: `${indicatorStyle.left}px`, 
                    width: `${indicatorStyle.width}px`,
                    opacity: indicatorStyle.opacity 
                }}
            />

            {navLinks.map((link, index) => (
              <a 
                key={link.name} 
                href={link.href}
                ref={(el) => { itemsRef.current[index] = el }}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium font-khmer transition-colors duration-300 ${
                  activeSection === link.href.substring(1)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Side Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4 relative z-50">
             {/* Language Switcher Dropdown */}
             <div className="relative" ref={langMenuRef}>
                 <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-medium text-gray-300 hover:text-white"
                 >
                    <img src={currentFlag} alt={language} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                    <span className="uppercase">{language === 'zh-CN' ? 'ZH' : language}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {/* Dropdown Menu */}
                 {isLangMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col p-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as any);
                                    setIsLangMenuOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm rounded-xl transition-colors font-khmer ${
                                    language === lang.code 
                                    ? 'bg-indigo-600/20 text-indigo-300' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <img src={lang.flag} alt={lang.label} className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0" />
                                    <span>{lang.label}</span>
                                </span>
                                {language === lang.code && <Check size={14} />}
                            </button>
                        ))}
                     </div>
                 )}
             </div>

             <a 
              href="#contact"
              onClick={(e) => scrollToSection(e, '#contact')}
              className="group px-5 py-2.5 rounded-full bg-white text-gray-950 font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2 font-khmer"
            >
              {t("Let's Talk", "ទំនាក់ទំនង")} <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Button & Language Switcher */}
          <div className="md:hidden flex items-center gap-4 z-50">
             {/* Mobile Language Switcher Dropdown */}
             <div className="relative" ref={mobileLangMenuRef}>
                 <button 
                    onClick={() => setIsMobileLangMenuOpen(!isMobileLangMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white font-medium"
                 >
                     <img src={currentFlag} alt={language} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                     <span className="font-mono uppercase">{language === 'zh-CN' ? 'ZH' : language}</span>
                     <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileLangMenuOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {/* Mobile Popup */}
                 {isMobileLangMenuOpen && (
                     <div className="absolute top-full right-0 mt-3 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col p-2 max-h-[60vh] overflow-y-auto">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as any);
                                    setIsMobileLangMenuOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-xl transition-colors font-khmer ${
                                    language === lang.code 
                                    ? 'bg-indigo-600/20 text-indigo-300' 
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <img src={lang.flag} alt={lang.label} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                                    <span>{lang.label}</span>
                                </span>
                                {language === lang.code && <Check size={14} />}
                            </button>
                        ))}
                     </div>
                 )}
             </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-gray-950 z-40 flex items-center justify-center transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         {/* Background Decoration */}
         <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px]" />
         <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-purple-600/20 blur-[100px]" />
         
         <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-sm px-6">
          {navLinks.map((link, idx) => (
            <a 
              key={link.name}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className={`text-3xl font-bold font-khmer text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 hover:to-white transition-all transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {link.name}
            </a>
          ))}
          
          <a 
             href="#contact"
             onClick={(e) => scrollToSection(e, '#contact')}
             className={`w-full text-center px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg font-khmer shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
             style={{ transitionDelay: '300ms' }}
          >
            {t("Start a Project", "ចាប់ផ្តើមគម្រោង")}
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
