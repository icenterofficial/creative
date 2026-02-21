import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook សម្រាប់គ្រប់គ្រង Routing
 * 
 * @param section ឈ្មោះ Section (ឧទាហរណ៍៖ 'portfolio')
 * @param idPrefix បុព្វបទសម្រាប់ ID (ប្រសិនបើមាន)
 * @param usePathRouting កំណត់ឱ្យប្រើ Path-based routing ជំនួសឱ្យ Hash
 */
export const useRouter = (section: string, idPrefix: string = '', usePathRouting: boolean = false) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Helper: បំប្លែង Data ID ទៅជា URL ID
  const toUrlId = useCallback((dataId: string) => {
    if (!idPrefix) return dataId;
    return dataId.startsWith(idPrefix) ? dataId.substring(idPrefix.length) : dataId;
  }, [idPrefix]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (usePathRouting && section === 'portfolio') {
        // ១. Path-based routing សម្រាប់ Portfolio: /portfolio/slug
        const pathname = window.location.pathname;
        // Regex ស្វែងរក slug បន្ទាប់ពី /portfolio/
        const portfolioMatch = /\/portfolio\/([^/]+)/.exec(pathname);
        
        if (portfolioMatch && portfolioMatch[1]) {
          setActiveId(portfolioMatch[1]);
        } else {
          setActiveId(null);
        }
      } else {
        // ២. Hash-based routing សម្រាប់ Section ផ្សេងៗ: #section/id
        const hash = window.location.hash;
        const prefix = `#${section}/`;

        if (hash.startsWith(prefix)) {
          const urlId = hash.replace(prefix, '');
          setActiveId(urlId || null);
        } else if (hash === `#${section}` || !hash.includes('/')) {
          setActiveId((prev) => (prev ? null : prev));
        }
      }
    };

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange); // តាមដានការប្តូរ Path (Forward/Back)
    
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [section, usePathRouting]);

  const openItem = useCallback((dataId: string) => {
    const urlId = toUrlId(dataId);
    
    if (usePathRouting && section === 'portfolio') {
      // ប្តូរទៅជា Clean Path URL: /portfolio/slug
      const currentLang = window.location.pathname.split('/')[1];
      const supportedLangs = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
      const newPath = currentLang && supportedLangs.includes(currentLang) 
        ? `/${currentLang}/portfolio/${urlId}` 
        : `/portfolio/${urlId}`;
      
      window.history.pushState({ section, id: urlId }, '', newPath);
      window.dispatchEvent(new Event('popstate'));
    } else {
      // ប្រើ Hash ធម្មតា: #section/id
      window.location.hash = `${section}/${urlId}`;
    }
  }, [section, toUrlId, usePathRouting]);

  const closeItem = useCallback(() => {
    try {
        if (usePathRouting && section === 'portfolio') {
          // ពេលបិទ ឱ្យត្រឡប់មក /portfolio វិញ
          const currentLang = window.location.pathname.split('/')[1];
          const supportedLangs = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
          const newPath = currentLang && supportedLangs.includes(currentLang) 
            ? `/${currentLang}/portfolio` 
            : `/portfolio`;
          
          window.history.replaceState(null, '', newPath);
          window.dispatchEvent(new Event('popstate'));
        } else {
          // សម្រាប់ Hash ឱ្យត្រឡប់មក #section វិញ
          window.history.replaceState(null, '', `#${section}`);
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

/**
 * Hook សម្រាប់គ្រប់គ្រងការបើក Admin Login តាមរយៈ Hash #admin
 */
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
            window.history.pushState("", document.title, window.location.pathname + window.location.search);
        } catch (e) {
            window.location.hash = '';
        }
        window.dispatchEvent(new Event('hashchange'));
    };

    return { isAdminOpen, closeAdmin };
};
