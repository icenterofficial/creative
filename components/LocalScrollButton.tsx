import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface LocalScrollButtonProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const LocalScrollButton: React.FC<LocalScrollButtonProps> = ({ containerRef }) => {
  const [isAtTop, setIsAtTop] = useState(true);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);

  // Visual Configuration (Same as ScrollButton.tsx)
  const size = 46;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const updateProgress = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;

    // Calculate progress (0 to 100)
    const progress = scrollHeight > 0 ? (currentScrollTop / scrollHeight) * 100 : 0;

    // Directly update SVG strokeDashoffset via DOM ref — no React re-render needed
    if (progressCircleRef.current) {
      const offset = circumference - (progress / 100) * circumference;
      progressCircleRef.current.style.strokeDashoffset = String(offset);
    }

    // Update isAtTop state (only triggers re-render when value actually changes)
    setIsAtTop(currentScrollTop < 100);
  }, [containerRef, circumference]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      // Cancel any pending RAF before scheduling a new one
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    container.addEventListener('scroll', onScroll, { passive: true });

    // Run once on mount to set initial state
    updateProgress();

    return () => {
      container.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef, updateProgress]);

  const handleClick = () => {
    const container = containerRef.current;
    if (!container) return;

    if (isAtTop) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } else {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center pointer-events-none">
      <button
        onClick={handleClick}
        className="relative flex items-center justify-center w-[46px] h-[46px] rounded-full bg-gray-900/80 backdrop-blur-md shadow-2xl group transition-transform hover:scale-105 border border-white/10 active:scale-95 pointer-events-auto"
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
            stroke="url(#localScrollGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
          />

          {/* Define Gradient */}
          <defs>
            <linearGradient id="localScrollGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
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

export default LocalScrollButton;
