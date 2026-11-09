import { useEffect } from "react";
import { useLocation } from "react-router";

export function ScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      return;
    }

    const elements = document.querySelectorAll<HTMLElement>("main [data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal-state", "visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    for (const element of elements) {
      element.setAttribute("data-reveal-state", "pending");
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [location.key]);

  return null;
}
