import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/useCart";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { CartSheet } from "@/components/CartSheet";
import { SearchOverlay } from "@/components/SearchOverlay";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { t } = useTranslation("common");
  const href = useLocalizedHref();
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_LINKS = [
    { to: href("/"), label: t("header.home") },
    { to: href("/shop"), label: t("header.shop") },
    { to: href("/discovery-sets"), label: t("header.discoverySets") },
    { to: href("/about"), label: t("header.about") },
  ];

  // Sticky header border-bottom only after scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 bg-paper transition-colors duration-quick ease-default " +
        (scrolled ? "border-b border-border" : "border-b border-transparent")
      }
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-14 md:h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to={href("/")} className="shrink-0">
          <img
            src="/logo.png"
            alt="modestshop"
            width={110}
            height={96}
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Center nav (desktop) */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-body text-text hover:text-mocha duration-instant ease-default"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="h-10 w-10 inline-flex items-center justify-center text-text hover:bg-surface-2 rounded-md duration-instant ease-default"
            aria-label={t("header.search")}
          >
            <Search />
          </button>

          <LanguageSwitcher variant="header" className="hidden md:flex mr-1" />

          <CartSheet>
            <button
              type="button"
              className="h-10 w-10 inline-flex items-center justify-center text-text hover:bg-surface-2 rounded-md duration-instant ease-default relative"
              aria-label={t("header.cart")}
            >
              <ShoppingBag />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-pill bg-mocha text-paper text-caption flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </CartSheet>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden h-10 w-10 inline-flex items-center justify-center text-text hover:bg-surface-2 rounded-md duration-instant ease-default"
                aria-label={t("header.menu")}
              >
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-[360px] bg-surface p-6">
              <nav className="flex flex-col gap-4 pt-4">
                <LanguageSwitcher variant="header" className="mb-2" />
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="text-h2 font-medium text-text-strong"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to={href("/contact")}
                  className="text-h2 font-medium text-text-strong"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("header.contact")}
                </Link>
                <Link
                  to={href("/faq")}
                  className="text-h2 font-medium text-text-strong"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("header.faq")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Header;
