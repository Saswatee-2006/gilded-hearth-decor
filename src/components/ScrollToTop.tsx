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
      const savedPosition = parseInt(
        sessionStorage.getItem(`scroll-pos-${location.key}`) || "0",
        10,
      );

      const tryScroll = () => {
        window.scrollTo(0, savedPosition);
      };

      tryScroll();

      // Fallback for asynchronous content
      const timeoutId = setTimeout(tryScroll, 100);
      return () => clearTimeout(timeoutId);
    } else {
      // It's a new navigation (PUSH or REPLACE). Scroll to top.
      window.scrollTo(0, 0);
    }
  }, [location.key, navigationType]);

  return null;
}
