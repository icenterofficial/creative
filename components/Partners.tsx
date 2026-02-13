import React from 'react';
import { PARTNERS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';

const Partners: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-gray-950 border-y border-white/5 relative overflow-hidden">
        {/* Gradient Fades */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <RevealOnScroll>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest font-khmer">
                {t('Trusted by innovative teams', 'ជឿទុកចិត្តដោយក្រុមហ៊ុនឈានមុខ')}
            </p>
          </RevealOnScroll>
        </div>

        <RevealOnScroll delay={200}>
          <div className="flex animate-scroll-slow w-max hover:pause">
              {/* Double the list for seamless loop */}
              {[...PARTNERS, ...PARTNERS].map((partner, index) => (
                  <div 
                      key={`${partner.id}-${index}`}
                      className="flex items-center gap-3 mx-8 md:mx-12 opacity-40 hover:opacity-100 transition-opacity duration-300 group cursor-default"
                  >
                      <div className="text-gray-300 group-hover:text-white transition-colors">
                          {partner.icon}
                      </div>
                      <span className="text-lg font-bold text-gray-300 group-hover:text-white font-khmer whitespace-nowrap">
                          {partner.name}
                      </span>
                  </div>
              ))}
          </div>
        </RevealOnScroll>

        <style>{`
            @keyframes scrollSlow {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-scroll-slow {
                animation: scrollSlow 60s linear infinite;
            }
            .hover\\:pause:hover {
                animation-play-state: paused;
            }
        `}</style>
    </section>
  );
};

export default Partners;