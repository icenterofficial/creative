
import React, { useEffect, useRef, useState } from 'react';

type RevealVariant = 'fade-up' | 'fade-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'blur-in' | 'grow-x';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: RevealVariant;
  threshold?: number;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  duration = 700, // Reduced from 800 for snappier feel
  variant = 'fade-up',
  threshold = 0.05 // Reduced threshold for earlier triggering
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -20px 0px' // Slightly less margin for better sync
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, [threshold]);

  const getTransformClasses = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100 blur-0';

    switch (variant) {
      case 'fade-up':
        return 'opacity-0 translate-y-8'; // Reduced distance for smoother transition
      case 'fade-down':
        return 'opacity-0 -translate-y-8';
      case 'slide-right':
        return 'opacity-0 -translate-x-8';
      case 'slide-left':
        return 'opacity-0 translate-x-8';
      case 'zoom-in':
        return 'opacity-0 scale-[0.98]';
      case 'blur-in':
        return 'opacity-0 blur-sm scale-[1.02]';
      case 'grow-x':
        return 'scale-x-0 opacity-0';
      default:
        return 'opacity-0 translate-y-8';
    }
  };

  return (
    <div
      ref={ref}
      className={`${className} transition-all cubic-bezier(0.25, 1, 0.5, 1) transform will-change-transform ${getTransformClasses()}`}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
