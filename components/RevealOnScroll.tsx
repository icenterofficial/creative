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
  duration = 800,
  variant = 'fade-up',
  threshold = 0.1
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
        rootMargin: '0px 0px -50px 0px'
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
        return 'opacity-0 translate-y-12';
      case 'fade-down':
        return 'opacity-0 -translate-y-12';
      case 'slide-right': // Enters from left
        return 'opacity-0 -translate-x-12';
      case 'slide-left': // Enters from right
        return 'opacity-0 translate-x-12';
      case 'zoom-in':
        return 'opacity-0 scale-95';
      case 'blur-in':
        return 'opacity-0 blur-sm scale-105';
      case 'grow-x':
        return 'scale-x-0 opacity-0';
      default:
        return 'opacity-0 translate-y-12';
    }
  };

  return (
    <div
      ref={ref}
      className={`${className} transition-all ease-out transform will-change-transform ${getTransformClasses()}`}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;