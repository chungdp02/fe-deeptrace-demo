import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <Button
      size="icon-lg"
      className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg sm:bottom-8 sm:right-8"
      aria-label={t("backToTop")}
      title={t("backToTop")}
      onClick={() => window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      })}
    >
      <ArrowUpIcon aria-hidden="true" />
    </Button>
  );
}
