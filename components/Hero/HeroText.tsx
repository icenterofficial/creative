
import React, { useEffect, useState } from 'react';

// --- Scramble / Decode Text Effect (English) ---
export const ScrambleText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  useEffect(() => {
    let iteration = 0;
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
// This ensures visibility and smooth animation
export const KhmerFadeText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  return (
    <span className={`inline-block ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block opacity-0"
          style={{
            animation: `simpleFadeRight 0.6s ease-out forwards`,
            animationDelay: `${index * 0.03}s`, // Fast stagger for smoothness
            marginRight: char === ' ' ? '0.3em' : '0' // Handle spaces
          }}
        >
          {char}
        </span>
      ))}
      <style>{`
        @keyframes simpleFadeRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
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
