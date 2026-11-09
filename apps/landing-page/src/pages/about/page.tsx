import { ArrowRightIcon, FingerprintIcon, Layers3Icon, ShieldCheckIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";
import aboutImage from "@/assets/images/about/deeptrace-future.jpg";

const principles = [
  { icon: FingerprintIcon, title: "about.identityTitle", description: "about.identityDescription" },
  { icon: Layers3Icon, title: "about.journeyTitle", description: "about.journeyDescription" },
  { icon: ShieldCheckIcon, title: "about.trustTitle", description: "about.trustDescription" },
] as const;

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1">
      <PageBanner title={t("nav.about")} subtitle={t("about.subtitle")} />

      <section className="bg-[#edeff4] px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-[#d8e0e8] sm:-inset-4" />
            <img
              src={aboutImage}
              alt={t("about.imageAlt")}
              width={1536}
              height={1024}
              className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/30 bg-[#0c263d]/90 p-4 text-white backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#add8ff]">DeepTrace</p>
              <p className="mt-1 text-sm font-medium leading-6">{t("about.imageHighlight")}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005aab]">{t("about.eyebrow")}</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#0c263d] sm:text-4xl lg:text-5xl">
              {t("about.heading")}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#0c263d]/75">{t("about.intro")}</p>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#0c263d]/75">{t("about.context")}</p>
            <Button asChild size="lg" className="mt-8 h-11 rounded-full px-6">
              <Link to="/industries">{t("about.exploreAction")} <ArrowRightIcon aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#0c263d] px-6 py-16 text-white sm:py-20 lg:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-15 [background-image:radial-gradient(circle,#add8ff_1px,transparent_1px)] [background-size:28px_28px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-48 -z-10 size-[28rem] rounded-full bg-[#005aab]/35 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#add8ff]">{t("about.principlesEyebrow")}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t("about.principlesTitle")}</h2>
            <p className="mt-5 leading-8 text-[#d8e0e8]">{t("about.principlesIntro")}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }) => (
              <Card key={title} data-reveal className="gap-0 rounded-2xl border border-[#8ea9c1]/30 bg-white/[0.06] py-0 text-white shadow-lg ring-0 backdrop-blur-sm transition-[background-color,border-color,box-shadow] duration-300 hover:border-[#add8ff]/60 hover:bg-white/[0.1] hover:shadow-xl">
                <CardHeader className="px-6 pt-7 pb-0">
                  <span className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#add8ff] text-[#0c263d]">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <CardTitle><h3 className="text-xl font-semibold">{t(title)}</h3></CardTitle>
                </CardHeader>
                <CardContent className="px-6 pt-3 pb-7 text-sm leading-7 text-[#d8e0e8]">{t(description)}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div data-reveal className="mx-auto flex max-w-7xl flex-col gap-7 rounded-2xl border border-[#d8e0e8] bg-[#add8ff] p-7 text-[#0c263d] sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("about.ctaTitle")}</h2>
            <p className="mt-3 leading-7">{t("about.ctaDescription")}</p>
          </div>
          <Button asChild size="lg" className="h-11 rounded-full px-6">
            <Link to="/contact">{t("about.ctaAction")} <ArrowRightIcon aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
