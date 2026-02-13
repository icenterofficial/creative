import React from 'react';

interface ScrollBackgroundTextProps {
  text: string;
  className?: string;
}

const ScrollBackgroundText: React.FC<ScrollBackgroundTextProps> = ({ text, className = '' }) => {
  return (
    <div 
      className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 flex justify-center items-start pt-12 md:pt-24 ${className}`}
      aria-hidden="true"
    >
      <h2 
        className="text-[10vw] md:text-[8vw] font-black text-white/[0.02] whitespace-nowrap leading-none tracking-tighter select-none"
      >
        {text}
      </h2>
    </div>
  );
};

export default ScrollBackgroundText;