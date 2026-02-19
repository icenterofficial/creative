
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { smoothScrollTo } from '../utils/scroll';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();
  
  const navRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
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
  ];

  const currentFlag = languages.find(l => l.code === language)?.flag || languages[0].flag;

  // 1. Scroll & Intersection Observer Logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
            setIsLangMenuOpen(false);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    // Observer to track which section is currently in view
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in upper-middle of screen
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      if (isManualScrolling.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections that have IDs matching our nav links
    navLinks.forEach(link => {
      const id = link.href.substring(1);
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, [language]);

  // 2. Update the animated background indicator
  useEffect(() => {
    const activeIndex = navLinks.findIndex(link => link.href.substring(1) === activeSection);
    if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
        const target = itemsRef.current[activeIndex];
        if (target) {
            setIndicatorStyle({
                left: target.offsetLeft,
                width: target.offsetWidth,
                opacity: 1
            });
        }
    } else if (activeSection === 'home') {
        // Default to home if at top
        const homeItem = itemsRef.current[0];
        if (homeItem) {
            setIndicatorStyle({
                left: homeItem.offsetLeft,
                width: homeItem.offsetWidth,
                opacity: 1
            });
        }
    }
  }, [activeSection, language]);

  // 3. Smooth Scroll Navigation
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    
    if (element) {
      isManualScrolling.current = true;
      setActiveSection(targetId);
      
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      
      smoothScrollTo(offsetPosition, 1000);
      
      // Unlock manual scroll tracking after animation finishes
      setTimeout(() => {
          isManualScrolling.current = false;
      }, 1100); 

      setIsMenuOpen(false);
    }
  };

  // 4. Close mobile menu when escape key is pressed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // 5. Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  return (
    <>
      {/* HEADER WRAPPER - Ensure this is fixed and at the top */}
      <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pt-4 pb-2 px-4 pointer-events-none">
        <div className={`mx-auto max-w-6xl w-full flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 rounded-full border transition-all duration-500 pointer-events-auto ${
            isScrolled 
            ? 'bg-gray-950/80 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
            : 'bg-white/5 backdrop-blur-md border-white/5'
        }`}>
          
          {/* Logo */}
          <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="flex items-center gap-2 group relative z-[110]">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">P</div>
            <span className="text-lg md:text-xl font-bold font-khmer tracking-tight text-white">
              ponloe<span className="text-gray-500 font-normal">.creative</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center relative bg-white/5 p-1 rounded-full border border-white/5">
            {/* Animated Indicator Background */}
            <div 
                className="absolute top-1 bottom-1 rounded-full bg-indigo-600/20 border border-indigo-500/20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" 
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
                    activeSection === link.href.substring(1) ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Side Tools */}
          <div className="flex items-center gap-2 relative z-[110]">
             {/* Language Dropdown */}
             <div className="relative" ref={langMenuRef}>
                 <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium text-gray-300"
                 >
                    <img src={currentFlag} alt={language} className="w-4 h-4 rounded-full object-cover shadow-sm" />
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 
                 {isLangMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-32 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1 animate-scale-up origin-top-right">
                        {languages.map((lang) => (
                            <button 
                                key={lang.code} 
                                onClick={() => { setLanguage(lang.code as any); setIsLangMenuOpen(false); }} 
                                className={`flex items-center justify-between w-full px-3 py-2.5 text-xs rounded-xl transition-colors font-khmer ${
                                    language === lang.code ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5'
                                }`}
                            >
                                <span>{lang.label}</span>
                                {language === lang.code && <Check size={12} />}
                            </button>
                        ))}
                     </div>
                 )}
             </div>

            {/* Mobile Menu Toggle */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="lg:hidden text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY - Higher z-index than header */}
      <div className={`fixed inset-0 bg-gray-950 z-[150] flex flex-col items-center justify-center transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}>
         {/* Close Button for Mobile Menu */}
         <button 
            onClick={() => setIsMenuOpen(false)} 
            className="absolute top-8 right-8 p-4 rounded-full bg-white/5 text-white border border-white/10 hover:rotate-90 transition-all duration-300"
         >
            <X size={28} />
         </button>

         {/* Navigation Links */}
         <nav className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
          {navLinks.map((link, idx) => (
            <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => scrollToSection(e, link.href)} 
                className={`text-3xl md:text-4xl font-bold font-khmer text-white hover:text-indigo-400 transition-all transform ${
                    isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`} 
                style={{ transitionDelay: `${idx * 70}ms` }}
            >
                {link.name}
            </a>
          ))}
          
          <div className={`mt-12 pt-8 border-t border-white/10 w-full flex justify-center gap-6 transition-all duration-1000 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-gray-500 text-sm font-mono tracking-widest uppercase">Ponloe Creative</span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
