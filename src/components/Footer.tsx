import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Footer = () => {
  const { t } = useTranslation("common");
  const href = useLocalizedHref();

  const FOOTER_LINKS = [
    { to: href("/shop"), label: t("footer.shop") },
    { to: href("/about"), label: t("footer.about") },
    { to: href("/contact"), label: t("footer.contact") },
    { to: href("/faq"), label: t("footer.faq") },
  ];

  return (
    <footer className="border-t border-border bg-paper mt-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-12 md:py-16">
          <Link to={href("/")} className="text-h2 md:text-h1-md font-medium text-text-strong tracking-[-0.02em]">
            modestshop
          </Link>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-body text-text hover:text-mocha duration-instant ease-default"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <a
            href="https://www.instagram.com/modest.shops/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text hover:text-mocha duration-instant ease-default"
            aria-label="Instagram"
          >
            <Instagram />
          </a>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-6 border-t border-border">
          <p className="text-caption text-text-muted italic">{t("footer.tagline")}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <LanguageSwitcher variant="footer" />
            <p className="text-caption text-text-muted">
              © 2026 modestshop ·{" "}
              <Link to={href("/privacy")} className="text-text-muted hover:text-text duration-instant ease-default">
                {t("footer.privacy")}
              </Link>{" "}
              ·{" "}
              <Link to={href("/terms")} className="text-text-muted hover:text-text duration-instant ease-default">
                {t("footer.terms")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
