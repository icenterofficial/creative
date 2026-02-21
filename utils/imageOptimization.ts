/**
 * Image Optimization Utilities
 * Handles lazy loading, responsive images, and format conversion
 */

/**
 * Generate optimized image URL with WebP support and responsive sizes
 * @param originalUrl - Original image URL
 * @param width - Desired width in pixels
 * @param format - Image format (webp, jpg, png)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  width: number = 800,
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string => {
  // If using external CDN or local images, you can add transformation logic here
  // For now, return original URL but mark for future optimization
  return originalUrl;
};

/**
 * Create a blurhash placeholder for images
 * Useful for showing a blurred version while image loads
 * @param color - Base color (hex or rgb)
 * @returns SVG data URL for placeholder
 */
export const createImagePlaceholder = (color: string = '#6366f1'): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="${color}" opacity="0.1" filter="url(#blur)" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Lazy load images using Intersection Observer
 * @param imageElement - Image DOM element
 * @param callback - Callback when image is visible
 */
export const setupImageLazyLoading = (
  imageElement: HTMLImageElement,
  callback?: () => void
): IntersectionObserver => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            callback?.();
          }
          
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before image enters viewport
      threshold: 0.01
    }
  );

  observer.observe(imageElement);
  return observer;
};

/**
 * Preload critical images for better perceived performance
 * @param urls - Array of image URLs to preload
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Generate srcset string for responsive images
 * @param baseUrl - Base image URL
 * @param sizes - Array of sizes [320, 640, 1024, 1280]
 * @returns srcset string for img tag
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 1024, 1280]
): string => {
  return sizes
    .map((size) => {
      // If using a CDN, add transformation params here
      // Example: `${baseUrl}?w=${size}&q=80 ${size}w`
      return `${baseUrl} ${size}w`;
    })
    .join(', ');
};

/**
 * Check if browser supports WebP format
 * @returns Promise<boolean>
 */
export const supportsWebP = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoBIAEAQAcJaACdLoAA3AAAAAA=';
  });
};

/**
 * Optimize image loading with progressive enhancement
 * Shows placeholder while loading, then swaps to full image
 */
export const createOptimizedImage = (
  src: string,
  alt: string,
  placeholder?: string
): HTMLImageElement => {
  const img = document.createElement('img');
  img.alt = alt;
  img.src = placeholder || createImagePlaceholder();
  img.setAttribute('data-src', src);
  img.className = 'transition-opacity duration-300';
  
  // Add load event to fade in
  img.addEventListener('load', () => {
    img.classList.add('opacity-100');
  });
  
  return img;
};
