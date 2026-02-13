import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const Preloader: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Disable scroll when preloader is active
    document.body.style.overflow = 'hidden';

    const duration = 2000; // 2 seconds loading
    const start = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for non-linear number increase
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(easeOutQuart * 100));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setTimeout(() => {
          setIsFinished(true);
          // Re-enable scroll after animation
          setTimeout(() => {
            document.body.style.overflow = '';
            setShowContent(true);
          }, 800);
        }, 200);
      }
    };

    requestAnimationFrame(updateCounter);

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (showContent) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gray-950 transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${isFinished ? '-translate-y-full' : 'translate-y-0'}`}
    >
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

      <div className={`flex flex-col items-center gap-8 transition-opacity duration-500 ${isFinished ? 'opacity-0' : 'opacity-100'}`}>
         {/* Pulsing Logo */}
         <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl flex items-center justify-center relative z-10 shadow-2xl">
                <Zap size={40} className="text-white fill-white animate-pulse" />
            </div>
         </div>
         
         {/* Counter */}
         <div className="flex flex-col items-center">
             <span className="text-8xl md:text-9xl font-bold text-white font-mono tracking-tighter">
                {count}%
             </span>
             <div className="h-1 w-32 bg-gray-800 rounded-full mt-4 overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-100 ease-out"
                    style={{ width: `${count}%` }}
                />
             </div>
         </div>
         
         <p className="text-gray-500 font-khmer text-sm animate-pulse tracking-[0.2em] uppercase mt-4">
            Ponloe Creative
         </p>
      </div>
    </div>
  );
};

export default Preloader;