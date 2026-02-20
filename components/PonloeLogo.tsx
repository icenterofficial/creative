
import React from 'react';

interface PonloeLogoProps {
  className?: string;
  size?: number;
}

const PonloeLogo: React.FC<PonloeLogoProps> = ({ className = "", size = 100 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 blur-2xl opacity-20 animate-pulse rounded-full" />
      
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-xl"
      >
        <defs>
          <linearGradient id="ponloeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" /> {/* Sky Blue */}
            <stop offset="50%" stopColor="#818CF8" /> {/* Indigo */}
            <stop offset="100%" stopColor="#C084FC" /> {/* Light Purple */}
          </linearGradient>
          
          <filter id="innerShadow">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="3" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.2" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        {/* The Hexagon Frame & Stylized 'P' */}
        <path 
          d="M100 20 L169.28 60 V140 L100 180 L30.72 140 V60 L100 20 Z" 
          stroke="url(#ponloeGradient)" 
          strokeWidth="18" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="opacity-20"
        />

        {/* Stylized P Shape */}
        <path 
          d="M70 160 V70 C70 50 90 40 110 40 H130 C155 40 170 60 170 85 C170 110 155 130 130 130 H70" 
          stroke="url(#ponloeGradient)" 
          strokeWidth="20" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#innerShadow)"
        />

        {/* Central Sparkle / Star */}
        <path 
          d="M120 70 Q125 85 140 90 Q125 95 120 110 Q115 95 100 90 Q115 85 120 70 Z" 
          fill="url(#ponloeGradient)"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};

export default PonloeLogo;
