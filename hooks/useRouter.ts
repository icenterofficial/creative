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
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  // Helper: បំប្លែង Data ID ទៅជា URL ID
  const toUrlId = useCallback((dataId: string) => {
    if (!idPrefix) return dataId;
    return dataId.startsWith(idPrefix) ? dataId.substring(idPrefix.length) : dataId;
  }, [idPrefix]);

  useEffect(() => {
    const handleRouteChange = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      if (usePathRouting) {
        // ១. Path-based routing: /section/slug ឬ /lang/section/slug
        // Regex ស្វែងរក slug បន្ទាប់ពី /section/
        const regex = new RegExp(`\\/${section}\\/([^/]+)`);
        const match = regex.exec(pathname);
        
        if (match && match[1]) {
          setActiveId(match[1]);
        } else {
          setActiveId(null);
        }
      } else {
        // ២. Hash-based routing សម្រាប់ Section ផ្សេងៗ: #section/id
        const prefix = `#${section}/`;

        if (hash.startsWith(prefix)) {
          const urlId = hash.replace(prefix, '');
          setActiveId(urlId || null);
        } else {
          setActiveId(null);
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
    const currentPath = window.location.pathname;
    const parts = currentPath.split('/');
    const currentLang = parts[1];
    const supportedLangs = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
    const langPrefix = currentLang && supportedLangs.includes(currentLang) ? `/${currentLang}` : '';

    // រក្សាទុក current path មុនពេលបើក item detail
    setPreviousPath(currentPath);

    if (usePathRouting) {
      // ប្តូរទៅជា Clean Path URL: /section/slug
      const newPath = `${langPrefix}/${section}/${urlId}`;
      window.history.pushState({ section, id: urlId, previousPath: currentPath }, '', newPath);
      window.dispatchEvent(new Event('popstate'));
    } else {
      // ប្រើ Hash ធម្មតា: #section/id
      window.location.hash = `${section}/${urlId}`;
    }
  }, [section, toUrlId, usePathRouting]);

  const closeItem = useCallback(() => {
    const currentPath = window.location.pathname;
    const parts = currentPath.split('/');
    const currentLang = parts[1];
    const supportedLangs = ['en', 'km', 'fr', 'ja', 'ko', 'de', 'zh-CN', 'es', 'ar'];
    const langPrefix = currentLang && supportedLangs.includes(currentLang) ? `/${currentLang}` : '';

    try {
        if (usePathRouting) {
          // ពេលបិទ ឱ្យត្រឡប់មក path ដែលរក្សាទុក ឬ /#section ប្រសិនបើគ្មាន previous path
          let targetUrl: string;
          
          if (previousPath && previousPath !== currentPath) {
            // ត្រឡប់មក previous path ដែលរក្សាទុក
            targetUrl = previousPath;
          } else {
            // ប្រសិនបើគ្មាន previous path ឬ same path ឱ្យត្រឡប់ទៅ hash anchor
            targetUrl = `${langPrefix || '/'}/#${section}`;
          }
          
          window.history.pushState(null, '', targetUrl);
          window.dispatchEvent(new Event('popstate'));
          window.dispatchEvent(new Event('hashchange'));
          setPreviousPath(null); // សម្អាត previous path បន្ទាប់ពីប្រើប្រាស់
        } else {
          // សម្រាប់ Hash ឱ្យត្រឡប់មក #section វិញ
          window.history.pushState(null, '', `${langPrefix || '/'}/#${section}`);
          window.dispatchEvent(new Event('hashchange'));
        }
    } catch (e) {
        window.location.hash = section;
    }
  }, [section, usePathRouting, previousPath]);

  return {
    activeId,
    openItem,
    closeItem,
    setPreviousPath
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
