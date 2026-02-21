import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook for managing Routing with support for both Hash and Path-based logic.
 * 
 * @param section The section name in the URL (e.g., 'team', 'portfolio')
 * @param idPrefix The prefix to strip/add (optional)
 * @param usePathRouting Whether to use path-based routing instead of hash (e.g., for clean portfolio URLs)
 */
export const useRouter = (section: string, idPrefix: string = '', usePathRouting: boolean = false) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Helper: Convert Data ID/Slug to URL ID
  const toUrlId = useCallback((dataId: string) => {
    if (!idPrefix) return dataId;
    return dataId.startsWith(idPrefix) ? dataId.substring(idPrefix.length) : dataId;
  }, [idPrefix]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (usePathRouting && section === 'portfolio') {
        // 1. Path-based routing for portfolio: /portfolio/slug
        const pathname = window.location.pathname;
        // Regex to match /portfolio/slug or /en/portfolio/slug
        const portfolioMatch = /\/portfolio\/([^/]+)/.exec(pathname);
        
        if (portfolioMatch && portfolioMatch[1]) {
          setActiveId(portfolioMatch[1]);
        } else {
          setActiveId(null);
        }
      } else {
        // 2. Hash-based routing for other sections: #section/id
        const hash = window.location.hash;
        const prefix = `#${section}/`;

        if (hash.startsWith(prefix)) {
          const urlId = hash.replace(prefix, '');
          if (urlId) {
              setActiveId(urlId);
          } else {
              setActiveId(null);
          }
        } else if (hash === `#${section}` || !hash.includes('/')) {
          setActiveId((prev) => (prev ? null : prev));
        }
      }
    };

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [section, usePathRouting]);

  const openItem = useCallback((dataId: string) => {
    const urlId = toUrlId(dataId);
    
    if (usePathRouting && section === 'portfolio') {
      // Use path-based routing for clean URLs
      const currentLang = window.location.pathname.split('/')[1];
      const supportedLangs = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
      const newPath = currentLang && supportedLangs.includes(currentLang) 
        ? `/${currentLang}/portfolio/${urlId}` 
        : `/portfolio/${urlId}`;
      
      window.history.pushState({ section, id: urlId }, '', newPath);
      window.dispatchEvent(new Event('popstate'));
    } else {
      // Use standard hash-based routing
      window.location.hash = `${section}/${urlId}`;
    }
  }, [section, toUrlId, usePathRouting]);

  const closeItem = useCallback(() => {
    try {
        if (usePathRouting && section === 'portfolio') {
          // For path-based routing, revert to /portfolio
          const currentLang = window.location.pathname.split('/')[1];
          const supportedLangs = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
          const newPath = currentLang && supportedLangs.includes(currentLang) 
            ? `/${currentLang}/portfolio` 
            : `/portfolio`;
          
          history.replaceState(null, '', newPath);
          window.dispatchEvent(new Event('popstate'));
        } else {
          // For hash-based routing, revert to #section
          history.replaceState(null, '', `#${section}`);
          window.dispatchEvent(new Event('hashchange'));
        }
    } catch (e) {
        if (usePathRouting && section === 'portfolio') {
          window.location.pathname = '/portfolio';
        } else {
          window.location.hash = section;
        }
    }
  }, [section, usePathRouting]);

  return {
    activeId,
    openItem,
    closeItem
  };
};

export const useAdminRouter = () => {
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    useEffect(() => {
        const checkHash = () => {
            setIsAdminOpen(window.location.hash === '#admin');
        };
        checkHash();
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const closeAdmin = () => {
        try {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        } catch (e) {
            window.location.hash = '';
        }
        window.dispatchEvent(new Event('hashchange'));
    };

    return { isAdminOpen, closeAdmin };
}
