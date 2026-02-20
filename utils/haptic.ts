export const triggerHaptic = (intensity = 10) => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    window.navigator.vibrate(intensity);
  }
};

// របៀបប្រើក្នុងប៊ូតុង៖
// <button onClick={() => { triggerHaptic(15); handleYourAction(); }}> ... </button>
