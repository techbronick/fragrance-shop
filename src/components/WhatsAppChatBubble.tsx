// Always-visible WhatsApp chat bubble. Mounted once at the app level.
// Sits bottom-left so it doesn't fight with BackToTop (bottom-right) or
// the mobile buy-bar (full-width). Lifts above the mobile buy-bar via
// the same data-mobile-bottom-bar measurement BackToTop uses, so the
// two floating actions never overlap the sticky bottom bar on PDPs.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { whatsappLink } from "@/utils/whatsapp";

const GAP_ABOVE_BAR_PX = 16;

export const WhatsAppChatBubble = () => {
  const { t } = useTranslation("common");
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  useEffect(() => {
    const measure = () => {
      const bar = document.querySelector<HTMLElement>("[data-mobile-bottom-bar]");
      setBottomBarHeight(bar ? bar.getBoundingClientRect().height : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    // Re-measure on scroll too: the buy-bar can mount/unmount on route
    // change, and we don't want a stale offset until the next resize.
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  return (
    <a
      href={whatsappLink(t("whatsapp.defaultMessage"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp.chatLabel")}
      className={[
        "fixed left-6 z-40",
        "h-14 w-14 rounded-full",
        "bg-[#25D366] text-white",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-[transform,box-shadow] duration-quick ease-default",
        "hover:scale-[1.06] active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
      ].join(" ")}
      style={{
        bottom:
          bottomBarHeight > 0
            ? `${bottomBarHeight + GAP_ABOVE_BAR_PX}px`
            : "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Official WhatsApp glyph (Wikimedia simplified) */}
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zM12.04 20.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42l-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.16 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.31z"/>
      </svg>
    </a>
  );
};

export default WhatsAppChatBubble;
