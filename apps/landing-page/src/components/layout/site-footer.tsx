import { MapPinIcon, PhoneIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import deepTraceLogo from "@/assets/images/deeptrace-logo.png";
import { contactPhoneLabel, contactPhoneNumber } from "@/lib/contact-info";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0c263d] text-[#edeff4]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-12">
        <div>
          <Link to="/" aria-label="DeepTrace - Trang chủ" className="inline-flex">
            <img
              src={deepTraceLogo}
              alt="DeepTrace"
              width={2170}
              height={725}
              className="h-auto w-48 brightness-0 invert"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#d8e0e8]">
            {t("footer.description")}
          </p>
        </div>

        <nav aria-label={t("footer.quickLinks")}>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#add8ff]">
            {t("footer.quickLinks")}
          </h2>
          <ul className="space-y-4 text-sm text-[#d8e0e8]">
            <li><Link className="hover:text-[#add8ff]" to="/">{t("nav.home")}</Link></li>
            <li><Link className="hover:text-[#add8ff]" to="/about">{t("nav.about")}</Link></li>
            <li><Link className="hover:text-[#add8ff]" to="/industries">{t("nav.categories")}</Link></li>
            <li><Link className="hover:text-[#add8ff]" to="/contact">{t("nav.contact")}</Link></li>
          </ul>
        </nav>

        <nav aria-label={t("footer.support")}>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#add8ff]">
            {t("footer.support")}
          </h2>
          <ul className="space-y-4 text-sm text-[#d8e0e8]">
            <li><Link className="hover:text-[#add8ff]" to="/contact">{t("footer.contact")}</Link></li>
            <li><a className="hover:text-[#add8ff]" href={`tel:${contactPhoneNumber}`}>{t("footer.callUs")}</a></li>
            <li><Link className="hover:text-[#add8ff]" to="/contact">{t("footer.sendMessage")}</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#add8ff]">
            {t("footer.contact")}
          </h2>
          <div className="space-y-5 text-sm leading-7 text-[#d8e0e8]">
            <a href={`tel:${contactPhoneNumber}`} className="flex items-start gap-3 hover:text-[#add8ff]">
              <PhoneIcon className="mt-1 size-4 shrink-0" aria-hidden="true" />
              <span>{contactPhoneLabel}</span>
            </a>
            <address className="flex items-start gap-3 not-italic">
              <MapPinIcon className="mt-1 size-4 shrink-0" aria-hidden="true" />
              <span>{t("footer.address")}</span>
            </address>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-[#8ea9c1]/25 px-6 py-6 text-xs text-[#8ea9c1]">
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
