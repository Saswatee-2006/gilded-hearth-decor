import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Disable browser's automatic scroll restoration to prevent conflicts
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-pos-${location.key}`, window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.key]);

  useEffect(() => {
    if (navigationType === "POP") {
      // It's a BACK or FORWARD navigation. Restore previous scroll position.
      const savedPosition = parseInt(sessionStorage.getItem(`scroll-pos-${location.key}`) || "0", 10);
      
      let retries = 0;
      const tryScroll = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        
        // Wait for asynchronous content to load before scrolling, up to a limit
        if (maxScroll >= savedPosition - 50 || retries > 15) {
          window.scrollTo(0, savedPosition);
          document.documentElement.scrollTop = savedPosition;
          document.body.scrollTop = savedPosition;
        } else {
          retries++;
          setTimeout(tryScroll, 50);
        }
      };
      
      tryScroll();
    } else {
      // It's a new navigation (PUSH or REPLACE). Scroll to top.
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Fallback: sometimes the browser overrides this after a paint, so we do it again in the next tick
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [location.key, navigationType]);

  return null;
}
