import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook for managing Hash-based Routing with ID Prefix handling.
 * 
 * @param section The section name in the URL (e.g., 'team', 'portfolio')
 * @param idPrefix The prefix to strip/add (e.g., 't' for team, 'p' for project). 
 *                 If data ID is 't1', URL becomes '#team/1'.
 */
export const useRouter = (section: string, idPrefix: string = '') => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Helper: Convert Data ID (e.g., 't1') to URL ID (e.g., '1')
  const toUrlId = useCallback((dataId: string) => {
    if (!idPrefix) return dataId;
    return dataId.startsWith(idPrefix) ? dataId.substring(idPrefix.length) : dataId;
  }, [idPrefix]);

  // Helper: Convert URL ID (e.g., '1') to Data ID (e.g., 't1')
  const toDataId = useCallback((urlId: string) => {
    if (!idPrefix) return urlId;
    // If the URL ID is already just a number or simple string, add the prefix back to match data
    return `${idPrefix}${urlId}`;
  }, [idPrefix]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash; // e.g., #team/1
      const prefix = `#${section}/`;

      if (hash.startsWith(prefix)) {
        const urlId = hash.replace(prefix, '');
        if (urlId) {
            setActiveId(toDataId(urlId));
        } else {
            setActiveId(null);
        }
      } else if (hash === `#${section}` || !hash.includes('/')) {
        // If we are just at the section root or another section entirely, close modal
        // But only set null if we were previously active to avoid unnecessary renders
        setActiveId((prev) => (prev ? null : prev));
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [section, toDataId]);

  const openItem = useCallback((dataId: string) => {
    const urlId = toUrlId(dataId);
    window.location.hash = `${section}/${urlId}`;
  }, [section, toUrlId]);

  const closeItem = useCallback(() => {
    // We use replaceState or pushState to avoid jumpy scrolling, 
    // keeping the user at the current section anchor
    const scrollY = window.scrollY;
    window.location.hash = section;
    // Restore scroll position immediately in case hash change caused a jump
    window.scrollTo(0, scrollY);
  }, [section]);

  return {
    activeId,
    openItem,
    closeItem
  };
};

/**
 * Hook specifically for the Admin/Login modal
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
        // Remove hash cleanly
        history.pushState("", document.title, window.location.pathname + window.location.search);
        // Trigger event manually since pushState doesn't trigger hashchange
        window.dispatchEvent(new Event('hashchange'));
    };

    return { isAdminOpen, closeAdmin };
}
