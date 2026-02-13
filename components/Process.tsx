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
          <div className="text-center mb-16">
            <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm font-khmer">{t('How We Work', 'របៀបធ្វើការ')}</span>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white font-khmer">
              {t('Our', 'ដំណើរការ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('Process', 'របស់យើង')}</span>
            </h2>
          </div>
        </RevealOnScroll>

        <div className="relative">
          {/* Connecting Line Background - Positioned relative to the grid */}
          <RevealOnScroll 
            variant="grow-x" 
            delay={200} 
            duration={1500} 
            className="absolute top-0 left-0 w-full h-px hidden lg:block z-0 origin-left"
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {PROCESS_STEPS.map((step, index) => (
              <RevealOnScroll 
                key={step.id} 
                variant="slide-right" 
                delay={index * 200} 
                duration={800}
              >
                <div 
                  className="relative group bg-gray-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 hover:-translate-y-2 h-full mt-6 lg:mt-0"
                >
                  {/* Step Number - Adjusted positioning to align with the line at top-0 of container */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-950 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 font-bold z-20 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    {step.number}
                  </div>

                  <div className="mt-6 text-center">
                    <div className="flex justify-center text-gray-400 mb-4 group-hover:text-white transition-colors">
                        {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 font-khmer">{t(step.title, step.titleKm)}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-khmer">
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