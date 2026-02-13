import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // Main Dot (Immediate)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      
      // Follower Ring (Delayed/Smoothed via keyframes or just simple lerp in complex setups, 
      // but here we use CSS transition for simplicity on the transform)
      if (followerRef.current) {
         // Using a slight delay in CSS transition usually works, 
         // but for true fluid motion, requestAnimationFrame is better. 
         // For React simplicity, we'll use direct DOM manipulation.
         followerRef.current.animate({
             transform: `translate3d(${clientX}px, ${clientY}px, 0)`
         }, {
             duration: 500,
             fill: "forwards"
         });
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Check if hovering over interactive elements
        if (
            target.tagName.toLowerCase() === 'a' ||
            target.tagName.toLowerCase() === 'button' ||
            target.closest('a') ||
            target.closest('button') ||
            target.classList.contains('cursor-pointer') ||
            target.getAttribute('role') === 'button'
        ) {
            setIsHovering(true);
        } else {
            setIsHovering(false);
        }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main Dot - Z-Index updated to 100000 */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-indigo-500 rounded-full pointer-events-none z-[100000] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      />
      
      {/* Follower Ring - Z-Index updated to 100000 */}
      <div 
        ref={followerRef}
        className={`fixed top-0 left-0 w-10 h-10 border border-white rounded-full pointer-events-none z-[100000] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out mix-blend-difference ${
            isHovering ? 'scale-[2.5] bg-white text-black border-transparent opacity-30' : 'scale-100 opacity-50'
        }`}
      />
    </>
  );
};

export default CustomCursor;