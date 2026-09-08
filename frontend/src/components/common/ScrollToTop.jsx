import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every page navigation resets scroll position to the top
 * and moves focus to the beginning of the newly loaded page.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // 1. If URL has a specific anchor hash (e.g., #contact or #reviews), jump to that element
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    // 2. Scroll main window and document to the top instantly
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 3. Reset scroll on any internal scrolling containers (AdminLTE content wrapper, modals, main tags)
    const scrollContainers = document.querySelectorAll(
      '.content-wrapper, .main-content, .adminlte-wrapper, main, #root'
    );
    scrollContainers.forEach(container => {
      if (container && container.scrollTop > 0) {
        container.scrollTop = 0;
      }
    });

    // 4. Focus on the primary page heading or main content area for accessibility and keyboard flow
    const timer = setTimeout(() => {
      const primaryTarget = 
        document.querySelector('main h1') || 
        document.querySelector('.content-header h1') || 
        document.querySelector('h1') || 
        document.querySelector('main');

      if (primaryTarget) {
        if (!primaryTarget.hasAttribute('tabindex')) {
          primaryTarget.setAttribute('tabindex', '-1');
        }
        primaryTarget.focus({ preventScroll: true });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
