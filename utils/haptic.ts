/**
 * Haptic Feedback Utility
 * Provides vibration patterns for better tactile user experience on mobile devices
 */

/**
 * Trigger basic haptic feedback
 * @param intensity - Vibration duration in milliseconds (default: 10ms)
 */
export const triggerHaptic = (intensity: number = 10): void => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate(intensity);
  }
};

/**
 * Light tap feedback (subtle, quick vibration)
 * Good for: Hover states, minor interactions
 */
export const hapticTap = (): void => {
  triggerHaptic(8);
};

/**
 * Medium feedback (noticeable but not intrusive)
 * Good for: Button clicks, form submissions, filter changes
 */
export const hapticMedium = (): void => {
  triggerHaptic(15);
};

/**
 * Heavy feedback (strong, noticeable vibration)
 * Good for: Important actions, language changes, critical confirmations
 */
export const hapticHeavy = (): void => {
  triggerHaptic(25);
};

/**
 * Success pattern (double tap)
 * Good for: Form submission success, upload completion
 */
export const hapticSuccess = (): void => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate([10, 50, 10]);
  }
};

/**
 * Error pattern (triple tap)
 * Good for: Form validation errors, failed operations
 */
export const hapticError = (): void => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate([20, 40, 20, 40, 20]);
  }
};

/**
 * Warning pattern (long vibration)
 * Good for: Important notifications, alerts
 */
export const hapticWarning = (): void => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate([30, 30, 30]);
  }
};

/**
 * Selection pattern (short double tap)
 * Good for: Selecting items, toggling options
 */
export const hapticSelection = (): void => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate([5, 30, 5]);
  }
};

/**
 * Scroll feedback (very light)
 * Good for: Scroll interactions, page transitions
 */
export const hapticScroll = (): void => {
  triggerHaptic(5);
};

/**
 * Language change pattern (distinctive pattern)
 * Good for: Language switching, major theme changes
 */
export const hapticLanguageChange = (): void => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate([15, 30, 15, 30, 15]);
  }
};

/**
 * Check if device supports haptic feedback
 */
export const supportsHaptic = (): boolean => {
  return typeof window !== 'undefined' && 'vibrate' in window.navigator;
};

/**
 * Disable all haptic feedback (for accessibility)
 */
let hapticDisabled = false;

export const disableHaptic = (): void => {
  hapticDisabled = true;
};

export const enableHaptic = (): void => {
  hapticDisabled = false;
};

export const isHapticDisabled = (): boolean => {
  return hapticDisabled;
};

/**
 * Wrapper function that respects disabled state
 */
export const triggerHapticIfEnabled = (pattern: () => void): void => {
  if (!hapticDisabled && supportsHaptic()) {
    pattern();
  }
};
