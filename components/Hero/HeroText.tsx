import React, { useEffect, useState, useMemo } from 'react';

// --- Scramble / Decode Text Effect (English) ---
export const ScrambleText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  useEffect(() => {
    let iteration = 0;
    // Reset to initial scrambled state when text changes
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3; 
    }, 30);

    return () => clearInterval(interval);
  }, [text, isHovered]);

  return (
    <span 
        className={`inline-block ${className}`}
        onMouseEnter={() => setIsHovered(!isHovered)}
    >
      {displayText}
    </span>
  );
};

// --- Simple Khmer Fade In (Left to Right) ---
// Uses Intl.Segmenter to prevent breaking Khmer clusters (legs/subscripts)
export const KhmerFadeText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  const segments = useMemo(() => {
      try {
          const IntlAny = Intl as any;
          if (typeof Intl !== 'undefined' && IntlAny.Segmenter) {
              const segmenter = new IntlAny.Segmenter('km', { granularity: 'grapheme' });
              return Array.from(segmenter.segment(text)).map((s: any) => s.segment);
          }
          return text.split('');
      } catch (e) {
          return text.split('');
      }
  }, [text]);

  return (
    <span className={`inline-block ${className}`}>
      {segments.map((char, index) => (
        <span
          key={index}
          className="inline-block opacity-0"
          style={{
            animation: `simpleFadeRight 0.6s ease-out forwards`,
            animationDelay: `${index * 0.04}s`,
            whiteSpace: 'pre' 
          }}
        >
          {char}
        </span>
      ))}
      <style>{`
        @keyframes simpleFadeRight {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </span>
  );
};
