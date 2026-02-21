import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { smoothScrollTo } from '../utils/scroll';

const ScrollButton: React.FC = () => {
  const [isAtTop, setIsAtTop] = useState(true);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);

  // Visual Configuration
  const size = 46;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const updateProgress = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Calculate progress (0 to 100)
    const progress = scrollHeight > 0 ? (currentScrollY / scrollHeight) * 100 : 0;

    // Directly update SVG strokeDashoffset via DOM ref — no React re-render needed
    if (progressCircleRef.current) {
      const offset = circumference - (progress / 100) * circumference;
      progressCircleRef.current.style.strokeDashoffset = String(offset);
    }

    // Update isAtTop state (only triggers re-render when value actually changes)
    setIsAtTop(currentScrollY < 100);
  }, [circumference]);

  useEffect(() => {
    const onScroll = () => {
      // Cancel any pending RAF before scheduling a new one
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Run once on mount to set initial state
    updateProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateProgress]);

  const handleClick = () => {
    if (isAtTop) {
      smoothScrollTo(document.documentElement.scrollHeight, 1200);
    } else {
      smoothScrollTo(0, 1200);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex items-center justify-center">
      <button
        onClick={handleClick}
        className="relative flex items-center justify-center w-[46px] h-[46px] rounded-full bg-white/5 backdrop-blur-md shadow-2xl group transition-transform hover:scale-105 border border-white/5 active:scale-95"
        aria-label={isAtTop ? "Scroll to Bottom" : "Scroll to Top"}
      >
        {/* SVG Circular Progress */}
        <svg
          className="absolute top-0 left-0 transform -rotate-90 pointer-events-none"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/10"
          />

          {/* Progress Circle with Gradient — updated directly via ref, no CSS transition */}
          <circle
            ref={progressCircleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scrollGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
          />

          {/* Define Gradient */}
          <defs>
            <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
              <stop offset="50%" stopColor="#a855f7" /> {/* Purple */}
              <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
            </linearGradient>
          </defs>
        </svg>

        {/* Icons */}
        <div className="relative w-5 h-5 text-white group-hover:text-indigo-300 transition-colors duration-300 z-10">
          <ArrowDown
            size={20}
            className={`absolute inset-0 transition-all duration-500 transform ${isAtTop ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-50'}`}
          />
          <ArrowUp
            size={20}
            className={`absolute inset-0 transition-all duration-500 transform ${!isAtTop ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-50'}`}
          />
        </div>
      </button>
    </div>
  );
};

export default ScrollButton;
