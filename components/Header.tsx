
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowUpRight, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { smoothScrollTo } from '../utils/scroll';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();

  const navRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);
  
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
  ];

  const currentFlag = languages.find(l => l.code === language)?.flag || languages[0].flag;

  useEffect(() => {
    let scrollTimeout: any;
    const handleScroll = () => {
      // Use requestAnimationFrame for scroll logic to prevent frame dropping
      if (!scrollTimeout) {
        scrollTimeout = requestAnimationFrame(() => {
            setIsScrolled(window.scrollY > 20);
            scrollTimeout = null;
        });
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setIsLangMenuOpen(false);
    };

    // Use passive: true to improve scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    const observer = new IntersectionObserver((entries) => {
      if (isManualScrolling.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });

    document.querySelectorAll('section').forEach(section => {
      if (section.id) observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    const activeIndex = navLinks.findIndex(link => link.href.substring(1) === activeSection);
    if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
        const { offsetLeft, offsetWidth } = itemsRef.current[activeIndex]!;
        setIndicatorStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    }
  }, [activeSection, language]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    
    if (element) {
      isManualScrolling.current = true;
      setActiveSection(targetId);
      
      const offset = 80;
      const pos = element.getBoundingClientRect().top + window.pageYOffset - offset;
      
      smoothScrollTo(pos, 800);
      
      setTimeout(() => {
          isManualScrolling.current = false;
      }, 900); 

      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300 flex justify-center px-4 pointer-events-none">
        <div className={`flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 rounded-full border transition-all duration-500 w-full max-w-6xl pointer-events-auto ${isScrolled ? 'bg-gray-950/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-indigo-500/10' : 'bg-transparent border-transparent'}`}>
          <a href="#" className="flex items-center gap-2 group relative z-50">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">P</div>
            <span className="text-lg md:text-xl font-bold font-khmer tracking-tight text-white">
              ponloe<span className="text-gray-500 font-normal">.creative</span>
            </span>
          </a>

          <nav ref={navRef} className="hidden lg:flex items-center relative bg-white/5 p-1.5 rounded-full border border-white/5">
            <div className="absolute top-1.5 bottom-1.5 rounded-full bg-white/10 transition-all duration-500 ease-out" style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px`, opacity: indicatorStyle.opacity }} />
            {navLinks.map((link, index) => (
              <a key={link.name} href={link.href} ref={(el) => { itemsRef.current[index] = el }} onClick={(e) => scrollToSection(e, link.href)} className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium font-khmer transition-colors duration-300 ${activeSection === link.href.substring(1) ? 'text-white' : 'text-gray-400 hover:text-white'}`}>{link.name}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2 relative z-50">
             <div className="relative" ref={langMenuRef}>
                 <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium text-gray-300">
                    <img src={currentFlag} alt={language} className="w-4 h-4 rounded-full object-cover" />
                    <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 {isLangMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-32 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1">
                        {languages.map((lang) => (
                            <button key={lang.code} onClick={() => { setLanguage(lang.code as any); setIsLangMenuOpen(false); }} className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-xl transition-colors font-khmer ${language === lang.code ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5'}`}>
                                <span>{lang.label}</span>
                                {language === lang.code && <Check size={12} />}
                            </button>
                        ))}
                     </div>
                 )}
             </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 bg-gray-950 z-[60] flex items-center justify-center transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
          {navLinks.map((link, idx) => (
            <a key={link.name} href={link.href} onClick={(e) => scrollToSection(e, link.href)} className={`text-3xl font-bold font-khmer text-white hover:text-indigo-400 transition-all transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: `${idx * 50}ms` }}>{link.name}</a>
          ))}
          <button onClick={() => setIsMenuOpen(false)} className="mt-8 p-4 rounded-full bg-white/5 text-white border border-white/10"><X size={24} /></button>
        </div>
      </div>
    </>
  );
};

export default Header;
