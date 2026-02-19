
import React from 'react';

interface NavLink {
  name: string;
  href: string;
}

interface NavLinksProps {
  links: NavLink[];
  activeSection: string;
  indicatorStyle: { left: number; width: number; opacity: number };
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  itemsRef: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
}

const NavLinks: React.FC<NavLinksProps> = ({ links, activeSection, indicatorStyle, onLinkClick, itemsRef }) => {
  return (
    <nav className="hidden lg:flex items-center relative bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
      {/* Animated Background Indicator */}
      <div 
        className="absolute top-1 bottom-1 rounded-full bg-indigo-600/20 border border-indigo-500/20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" 
        style={{ 
          left: `${indicatorStyle.left}px`, 
          width: `${indicatorStyle.width}px`, 
          opacity: indicatorStyle.opacity 
        }} 
      />
      
      {links.map((link, index) => (
        <a 
          key={link.name} 
          href={link.href} 
          ref={(el) => { itemsRef.current[index] = el }} 
          onClick={(e) => onLinkClick(e, link.href)} 
          className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium font-khmer transition-colors duration-300 ${
            activeSection === link.href.substring(1) ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          {link.name}
        </a>
      ))}
    </nav>
  );
};

export default NavLinks;
