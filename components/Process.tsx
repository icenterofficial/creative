
import React from 'react';
import { PROCESS_STEPS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';

const Process: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll variant="fade-down">
          <div className="text-center mb-20">
            <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm font-khmer">{t('How We Work', 'របៀបធ្វើការ')}</span>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white font-khmer">
              {t('Our', 'ដំណើរការ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('Process', 'របស់យើង')}</span>
            </h2>
          </div>
        </RevealOnScroll>

        <div className="relative pt-6 lg:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {PROCESS_STEPS.map((step, index) => (
              <RevealOnScroll 
                key={step.id} 
                variant="slide-right" 
                delay={index * 150} 
                duration={800}
              >
                <div 
                  className="group relative bg-gray-900/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-gray-800/60 transition-all duration-500 hover:-translate-y-3 h-full mt-8 lg:mt-0 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30"
                >
                  {/* --- INTERACTIVE NODE (The Number Circle) --- */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 z-20">
                      {/* Outer Ring (Expands on Hover) */}
                      <div className="absolute inset-0 rounded-full border border-indigo-500/30 bg-gray-950 transition-all duration-500 group-hover:scale-125 group-hover:border-indigo-400/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"></div>
                      
                      {/* Inner Circle (Changes Color) */}
                      <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center text-indigo-400 font-bold transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white border border-white/5 group-hover:border-transparent">
                        {step.number}
                      </div>
                  </div>

                  <div className="mt-10 text-center relative z-10">
                    {/* Icon with float animation on hover */}
                    <div className="flex justify-center text-gray-500 mb-5 group-hover:text-indigo-300 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110">
                        {/* Clone icon to add drop shadow effect via filter in CSS if needed, or just color change */}
                        <div className="p-3 rounded-full bg-white/5 group-hover:bg-indigo-500/20 transition-colors duration-500">
                            {step.icon}
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 font-khmer group-hover:text-indigo-200 transition-colors">{t(step.title, step.titleKm)}</h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed font-khmer group-hover:text-gray-300 transition-colors">
                      {t(step.description, step.descriptionKm || step.description)}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
