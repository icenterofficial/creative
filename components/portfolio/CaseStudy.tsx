
import React, { useRef, useEffect, useState } from 'react';
import { Target, Zap, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import RevealOnScroll from '../RevealOnScroll';

interface CaseStudyProps {
  challenge?: string;
  challengeKm?: string;
  solution?: string;
  solutionKm?: string;
  result?: string;
  resultKm?: string;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const CaseStudy: React.FC<CaseStudyProps> = ({ 
  challenge, challengeKm, 
  solution, solutionKm, 
  result, resultKm, 
  scrollContainerRef 
}) => {
  const { t } = useLanguage();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle Scroll Animation Logic
  useEffect(() => {
      const handleScroll = () => {
          if (!timelineRef.current || !scrollContainerRef.current) return;

          const timeline = timelineRef.current;
          const timelineRect = timeline.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // Trigger point relative to viewport
          const startTrigger = viewportHeight * 0.8; 
          
          const distanceTop = startTrigger - timelineRect.top;
          const totalHeight = timelineRect.height + (viewportHeight * 0.3);

          let progress = (distanceTop / totalHeight) * 100;
          if (timelineRect.top > startTrigger) progress = 0;
          progress = Math.min(100, Math.max(0, progress));
          
          setScrollProgress(progress);
      };

      const container = scrollContainerRef.current;
      if (container) {
          container.addEventListener('scroll', handleScroll);
          handleScroll(); // Initial check
      }

      return () => {
          if (container) container.removeEventListener('scroll', handleScroll);
      };
  }, [scrollContainerRef]);

  if (!challenge && !solution && !result) return null;

  return (
    <div className="relative py-8" ref={timelineRef}>
        {/* The Center Lines */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-white/10 z-0"></div>
        <div 
            className="absolute left-6 top-4 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 z-0 transition-all duration-300 ease-out"
            style={{ height: `${scrollProgress}%` }}
        >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
        </div>

        <div className="space-y-16">
            {/* 1. Challenge */}
            {(challenge || challengeKm) && (
                <div className="relative pl-20 group">
                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-full bg-gray-900 border-2 flex items-center justify-center z-10 transition-all duration-500 ${scrollProgress > 10 ? 'border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-gray-700 text-gray-500'}`}>
                        <Target size={20} />
                    </div>
                    
                    <RevealOnScroll variant="slide-right">
                        <h5 className={`text-lg font-bold mb-2 font-khmer transition-colors duration-500 ${scrollProgress > 10 ? 'text-red-400' : 'text-gray-400'}`}>
                            {t('The Challenge', 'បញ្ហាប្រឈម')}
                        </h5>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-khmer bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-red-500/20 transition-colors">
                            {t(challenge!, challengeKm || challenge!)}
                        </p>
                    </RevealOnScroll>
                </div>
            )}

            {/* 2. Solution */}
            {(solution || solutionKm) && (
                <div className="relative pl-20 group">
                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-full bg-gray-900 border-2 flex items-center justify-center z-10 transition-all duration-500 ${scrollProgress > 45 ? 'border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-gray-700 text-gray-500'}`}>
                        <Zap size={20} />
                    </div>

                    <RevealOnScroll variant="slide-right" delay={100}>
                        <h5 className={`text-lg font-bold mb-2 font-khmer transition-colors duration-500 ${scrollProgress > 45 ? 'text-blue-400' : 'text-gray-400'}`}>
                            {t('The Solution', 'ដំណោះស្រាយ')}
                        </h5>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-khmer bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors">
                            {t(solution!, solutionKm || solution!)}
                        </p>
                    </RevealOnScroll>
                </div>
            )}

            {/* 3. Result */}
            {(result || resultKm) && (
                <div className="relative pl-20 group">
                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-full bg-gray-900 border-2 flex items-center justify-center z-10 transition-all duration-500 ${scrollProgress > 80 ? 'border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-gray-700 text-gray-500'}`}>
                        <TrendingUp size={20} />
                    </div>

                    <RevealOnScroll variant="slide-right" delay={200}>
                        <h5 className={`text-lg font-bold mb-2 font-khmer transition-colors duration-500 ${scrollProgress > 80 ? 'text-green-400' : 'text-gray-400'}`}>
                            {t('The Result', 'លទ្ធផល')}
                        </h5>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-khmer bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-green-500/20 transition-colors">
                            {t(result!, resultKm || result!)}
                        </p>
                    </RevealOnScroll>
                </div>
            )}
        </div>
    </div>
  );
};

export default CaseStudy;
