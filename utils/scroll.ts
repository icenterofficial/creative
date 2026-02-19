
export const smoothScrollTo = (targetY: number, duration: number = 800) => {
  // Use native smooth scrolling if possible - it's handled by the browser engine (much smoother)
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
    return;
  }

  // Fallback for older browsers
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime: number | null = null;

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    window.scrollTo(0, startY + (distance * easeInOutCubic(progress)));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};
