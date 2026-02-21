/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and other performance metrics
 */

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
  loadTime?: number; // Total page load time
}

/**
 * Initialize performance monitoring
 * Tracks Core Web Vitals and reports them
 */
export const initPerformanceMonitoring = (): void => {
  // Only run in production or when explicitly enabled
  if (typeof window === 'undefined') return;

  const metrics: PerformanceMetrics = {};

  // Track First Contentful Paint
  try {
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = Math.round(entry.startTime);
      }
    });
  } catch (e) {
    console.warn('FCP tracking not available');
  }

  // Track Largest Contentful Paint using PerformanceObserver
  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
        
        // Log when LCP is ready
        if (metrics.lcp) {
          console.log(`LCP: ${metrics.lcp}ms`);
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  } catch (e) {
    console.warn('LCP tracking not available');
  }

  // Track Cumulative Layout Shift
  try {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue;
          clsValue += (entry as any).value;
          metrics.cls = parseFloat(clsValue.toFixed(3));
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  } catch (e) {
    console.warn('CLS tracking not available');
  }

  // Track Total Load Time
  window.addEventListener('load', () => {
    metrics.loadTime = Math.round(performance.now());
    console.log('Performance Metrics:', metrics);
    
    // Send to analytics service if needed
    reportMetrics(metrics);
  });
};

/**
 * Report metrics to analytics service
 * @param metrics - Performance metrics object
 */
export const reportMetrics = (metrics: PerformanceMetrics): void => {
  // Example: Send to Google Analytics, Sentry, or custom endpoint
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      fcp: metrics.fcp,
      lcp: metrics.lcp,
      cls: metrics.cls,
      load_time: metrics.loadTime
    });
  }
};

/**
 * Measure execution time of a function
 * @param name - Function name for logging
 * @param fn - Function to measure
 * @returns Function result
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Debounce function for performance-critical event handlers
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * Throttle function for performance-critical event handlers
 * @param fn - Function to throttle
 * @param limit - Limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastRun = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    }
  };
};

/**
 * Get current memory usage (if available)
 * @returns Memory info or null
 */
export const getMemoryUsage = (): any => {
  if ((performance as any).memory) {
    return {
      usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1048576) + 'MB',
      totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1048576) + 'MB',
      jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576) + 'MB'
    };
  }
  return null;
};

/**
 * Log performance metrics to console (development only)
 */
export const logPerformanceMetrics = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const metrics = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (metrics) {
      console.table({
        'DNS Lookup': `${(metrics.domainLookupEnd - metrics.domainLookupStart).toFixed(2)}ms`,
        'TCP Connection': `${(metrics.connectEnd - metrics.connectStart).toFixed(2)}ms`,
        'Request Time': `${(metrics.responseStart - metrics.requestStart).toFixed(2)}ms`,
        'Response Time': `${(metrics.responseEnd - metrics.responseStart).toFixed(2)}ms`,
        'DOM Interactive': `${(metrics.domInteractive - metrics.fetchStart).toFixed(2)}ms`,
        'DOM Complete': `${(metrics.domComplete - metrics.fetchStart).toFixed(2)}ms`,
        'Load Complete': `${(metrics.loadEventEnd - metrics.fetchStart).toFixed(2)}ms`
      });
    }
  }
};
