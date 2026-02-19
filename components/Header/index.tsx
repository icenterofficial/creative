
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { smoothScrollTo } from '../../utils/scroll';
import NavLinks from './NavLinks';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const { language, t } = useLanguage();
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
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      if (isManualScrolling.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          const id = entry.target.id;
          setActiveSection(id);
          
          // Address Bar Update: Sync URL without jumping
          if (window.location.hash !== `#${id}`) {
            history.replaceState(null, '', `#${id}`);
          }
        }
      });
    }, observerOptions);

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

  // 2. Indicator Animation Logic
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

  // 3. Smooth Scroll Navigation
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
      
      // Update hash in address bar
      history.pushState(null, '', href);
      
      setTimeout(() => {
        isManualScrolling.current = false;
      }, 1100); 
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pt-4 pb-2 px-4 pointer-events-none">
        <div className={`mx-auto max-w-7xl w-full flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 rounded-full border transition-all duration-500 pointer-events-auto ${
          isScrolled 
          ? 'bg-gray-950/80 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
          : 'bg-white/5 backdrop-blur-md border-white/5'
        }`}>
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="flex items-center gap-2 group relative z-[110]">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">P</div>
              <span className="text-lg md:text-xl font-bold font-khmer tracking-tight text-white">
                ponloe<span className="text-gray-500 font-normal">.creative</span>
              </span>
            </a>

            {/* Nav Links - Centralized */}
            <NavLinks 
              links={navLinks} 
              activeSection={activeSection} 
              indicatorStyle={indicatorStyle} 
              onLinkClick={scrollToSection} 
              itemsRef={navLinksRef} 
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4 relative z-[110]">
            <LanguageSelector 
              isOpen={isLangMenuOpen} 
              setIsOpen={setIsLangMenuOpen} 
              containerRef={langMenuRef} 
            />

            {/* Contact CTA - RESTORED */}
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, '#contact')}
              className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-white text-gray-950 text-xs font-bold font-khmer hover:bg-indigo-500 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              {t('Get a Quote', 'ស្នើសុំតម្លៃ')}
              <ArrowUpRight size={14} />
            </a>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="lg:hidden text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-gray-950 z-[150] flex flex-col items-center justify-center transition-all duration-500 ${
        isMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}>
         <button 
            onClick={() => setIsMenuOpen(false)} 
            className="absolute top-8 right-8 p-4 rounded-full bg-white/5 text-white border border-white/10"
         >
            <X size={28} />
         </button>

         <nav className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
          {navLinks.map((link, idx) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => scrollToSection(e, link.href)} 
              className={`text-3xl font-bold font-khmer text-white hover:text-indigo-400 transition-all transform ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`} 
              style={{ transitionDelay: `${idx * 70}ms` }}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            onClick={(e) => scrollToSection(e, '#contact')}
            className="mt-8 px-10 py-4 rounded-full bg-indigo-600 text-white font-bold font-khmer text-lg"
          >
            {t('Get Started', 'ចាប់ផ្តើម')}
          </a>
        </nav>
      </div>
    </>
  );
};

export default Header;
