import deepTraceLogo from "@/assets/images/deeptrace-logo.png";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "@/components/layout/language-select";

const navigation = [
  { labelKey: "nav.home", to: "/" },
  { labelKey: "nav.about", to: "/about" },
  { labelKey: "nav.categories", to: "/industries" },
  { labelKey: "nav.contact", to: "/contact" },
];

export function SiteHeader() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/\/+$/, "") || "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          to="/"
          aria-label="DeepTrace - Trang chủ"
          className="inline-flex w-fit items-center"
        >
          <img
            src={deepTraceLogo}
            alt="DeepTrace"
            width={2170}
            height={725}
            className="h-auto w-32 sm:w-44 lg:w-48"
          />
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
          {navigation.map(({ labelKey, to }) => (
            <Button key={to} asChild variant={currentPath === to ? "secondary" : "ghost"}>
              <Link
                to={to}
                aria-current={currentPath === to ? "page" : undefined}
                className={currentPath === to ? "text-primary" : undefined}
              >
                {t(labelKey)}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 md:justify-self-end">
          <LanguageSelect compact triggerClassName="hidden w-24 md:flex" />
          <Button asChild className="shadow-sm">
            <Link to="/login">{t("nav.login")}</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("nav.openMenu")}>
                <MenuIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="md:hidden">
              <SheetHeader>
                <SheetTitle>{t("nav.menu")}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Điều hướng di động" className="flex flex-col gap-1 px-4">
                {navigation.map(({ labelKey, to }) => (
                  <SheetClose key={to} asChild>
                    <Link
                      to={to}
                      aria-current={currentPath === to ? "page" : undefined}
                      className={buttonVariants({
                        variant: currentPath === to ? "secondary" : "ghost",
                        className: `w-full justify-start ${currentPath === to ? "text-primary" : ""}`,
                      })}
                    >
                      {t(labelKey)}
                    </Link>
                  </SheetClose>
                ))}
                <LanguageSelect triggerClassName="w-full" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
