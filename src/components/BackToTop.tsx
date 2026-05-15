// src/components/BackToTop.tsx
//
// Floating "scroll to top" button. Mounted once at app level — it
// self-manages visibility (appears after the user has scrolled past
// one viewport) and is invisible otherwise, so it costs nothing on
// short pages. Smooth-scrolls to top on click.

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const SHOW_AFTER_PX = 600; // ~one viewport on most phones

export const BackToTop = () => {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("backToTop", { defaultValue: "Back to top" })}
      // Sits above the iOS home-indicator on mobile via env() safe-area
      // padding. z-40 keeps it under modal dialogs but above page content.
      className={[
        "fixed bottom-6 right-6 z-40",
        "h-11 w-11 rounded-full",
        "bg-text-strong text-paper",
        "shadow-md hover:shadow-lg",
        "flex items-center justify-center",
        "transition-[opacity,transform,box-shadow] duration-quick ease-default",
        "hover:scale-[1.06] active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
      ].join(" ")}
      style={{
        // respect iOS safe-area at the bottom of the viewport
        bottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
