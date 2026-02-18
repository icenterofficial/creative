import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook for managing Hash-based Routing with ID/Slug handling.
 * 
 * @param section The section name in the URL (e.g., 'team', 'portfolio')
 * @param idPrefix The prefix to strip/add (optional)
 */
export const useRouter = (section: string, idPrefix: string = '') => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Helper: Convert Data ID/Slug to URL ID
  const toUrlId = useCallback((dataId: string) => {
    if (!idPrefix) return dataId;
    return dataId.startsWith(idPrefix) ? dataId.substring(idPrefix.length) : dataId;
  }, [idPrefix]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash; // e.g., #portfolio/my-project-slug
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
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [section]);

  const openItem = useCallback((dataId: string) => {
    const urlId = toUrlId(dataId);
    window.location.hash = `${section}/${urlId}`;
  }, [section, toUrlId]);

  const closeItem = useCallback(() => {
    try {
        // Use replaceState to clear the deep link without jumping the scroll
        history.replaceState(null, '', `#${section}`);
        window.dispatchEvent(new Event('hashchange'));
    } catch (e) {
        window.location.hash = section;
    }
  }, [section]);

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
