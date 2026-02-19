
import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Star } from 'lucide-react';

// --- Count Up Component ---
const CountUp: React.FC<{ end: number, duration: number, suffix?: string }> = ({ end, duration, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

// --- Magnetic Button Component ---
const MagneticButton: React.FC<{ children: React.ReactNode, className?: string, href?: string }> = ({ children, className, href }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3; 
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <a
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className={`relative inline-block transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </a>
  );
};

interface HeroActionsProps {
    t: (en: string, km: string) => string;
}

const HeroActions: React.FC<HeroActionsProps> = ({ t }) => {
  return (
    <div className="space-y-8">
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <MagneticButton 
            href="#portfolio"
            className="group px-8 py-4 rounded-full bg-white text-gray-950 font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 font-khmer w-full sm:w-auto"
            >
            {t('View Our Work', 'មើលស្នាដៃ')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
            <MagneticButton 
            href="#contact"
            className="px-8 py-4 rounded-full bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm font-khmer w-full sm:w-auto"
            >
            {t('Contact Us', 'ទាក់ទងយើង')} <ChevronRight size={20} className="opacity-50" />
            </MagneticButton>
        </div>

        {/* Stats */}
        <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-white/5">
            <div className="text-center lg:text-left">
                <h4 className="text-3xl font-black text-white"><CountUp end={50} duration={2000} suffix="+" /></h4>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold font-khmer">{t('Projects', 'គម្រោង')}</p>
            </div>
            <div className="text-center lg:text-left">
                <h4 className="text-3xl font-black text-white"><CountUp end={99} duration={2000} suffix="%" /></h4>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold font-khmer">{t('Satisfaction', 'ការពេញចិត្ត')}</p>
            </div>
            <div className="flex items-center gap-1 w-full justify-center lg:w-auto pl-4 border-l border-white/5">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900" />)}
                </div>
                <div className="ml-3">
                    <div className="flex text-yellow-400"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                    <span className="text-[10px] text-gray-400 font-bold">Trust by Partners</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HeroActions;
