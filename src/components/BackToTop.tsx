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
const GAP_ABOVE_BAR_PX = 16;

export const BackToTop = () => {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);
  // Measured height of any sticky mobile bottom bar in the DOM
  // (product MobileBuyBar, discovery buy/build bars, checkout submit bar —
  // each tagged with data-mobile-bottom-bar). 0 when no bar is present, so
  // the button reverts to its baseline corner position.
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  useEffect(() => {
    const measureBar = () => {
      const bar = document.querySelector<HTMLElement>("[data-mobile-bottom-bar]");
      return bar ? bar.getBoundingClientRect().height : 0;
    };
    const update = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
      setBottomBarHeight(measureBar());
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
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
        // When a sticky mobile buy-bar is present, sit above it with a small
        // gap; otherwise use the baseline corner with iOS safe-area padding.
        bottom:
          bottomBarHeight > 0
            ? `${bottomBarHeight + GAP_ABOVE_BAR_PX}px`
            : "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
