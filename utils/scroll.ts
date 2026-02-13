export const smoothScrollTo = (targetY: number, duration: number = 1000) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime: number | null = null;

  // Easing function: easeInOutCubic (Faster start than Quart, still smooth)
  // This prevents the "stuck" feeling at the beginning of the animation
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + (distance * ease));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};