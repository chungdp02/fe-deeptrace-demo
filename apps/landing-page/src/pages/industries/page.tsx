import { useTranslation } from "react-i18next";
import { PageBanner } from "@/components/layout/page-banner";
import { CategoriesList } from "@/features/categories/categories-list";
import { Button } from "@/components/ui/button";
import { GitBranchIcon, PackageIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";
import workflowImage from "@/assets/images/industries/traceability-workflow.jpg";

export default function IndustriesPage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1 bg-[#edeff4]">
      <PageBanner title={t("nav.categories")} subtitle={t("industries.subtitle")} />
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div data-reveal className="mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("industries.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("industries.heading")}</h2>
          <p className="mt-5 text-base leading-8 text-foreground/70">{t("industries.intro")}</p>
        </div>
        <CategoriesList />
      </section>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div data-reveal className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <img src={workflowImage} alt={t("industries.workflowImageAlt")} width={1536} height={1024} loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("industries.workflowEyebrow")}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{t("industries.workflowTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-foreground/70">{t("industries.workflowIntro")}</p>
            <ol className="mt-8 space-y-4">
              {([
                { icon: PackageIcon, title: "industries.stepIdentityTitle", description: "industries.stepIdentityDescription" },
                { icon: GitBranchIcon, title: "industries.stepJourneyTitle", description: "industries.stepJourneyDescription" },
                { icon: SearchIcon, title: "industries.stepLookupTitle", description: "industries.stepLookupDescription" },
              ] as const).map(({ icon: Icon, title, description }, index) => (
                <li key={title} className="flex gap-4 rounded-xl border border-[#d8e0e8] bg-[#edeff4] p-4 sm:p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#add8ff] text-[#0c263d]"><Icon className="size-5" aria-hidden="true" /></span>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.12em] text-primary">0{index + 1}</p>
                    <h3 className="mt-1 font-semibold">{t(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">{t(description)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div data-reveal className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#8ea9c1] bg-[#add8ff] px-7 py-9 text-[#0c263d] sm:px-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">{t("industries.ctaTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#0c263d]">{t("industries.ctaDescription")}</p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/contact">{t("industries.ctaAction")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
