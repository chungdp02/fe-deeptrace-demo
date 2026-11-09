import { ArrowRightIcon, BlocksIcon, FingerprintIcon, GitBranchIcon, ScanSearchIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/images/home/deeptrace-hero.jpg";
import workflowImage from "@/assets/images/industries/traceability-workflow.jpg";
import healthcareImage from "@/assets/images/industries/healthcare.jpg";
import foodImage from "@/assets/images/industries/food-agriculture.jpg";
import consumerImage from "@/assets/images/industries/consumer-goods.jpg";

const benefits = [
  { icon: FingerprintIcon, title: "home.benefitIdentityTitle", description: "home.benefitIdentityDescription" },
  { icon: GitBranchIcon, title: "home.benefitJourneyTitle", description: "home.benefitJourneyDescription" },
  { icon: ScanSearchIcon, title: "home.benefitLookupTitle", description: "home.benefitLookupDescription" },
] as const;

const industries = [
  { image: healthcareImage, title: "home.industryHealthcare", description: "home.industryHealthcareDescription" },
  { image: foodImage, title: "home.industryFood", description: "home.industryFoodDescription" },
  { image: consumerImage, title: "home.industryConsumer", description: "home.industryConsumerDescription" },
] as const;

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1">
      <section className="relative isolate overflow-hidden bg-[#0c263d] px-6 py-16 text-white sm:py-20 lg:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(circle,#add8ff_1px,transparent_1px)] [background-size:32px_32px]" />
        <div aria-hidden="true" className="home-hero-glow pointer-events-none absolute -right-32 -top-36 -z-10 size-[34rem] rounded-full bg-[#005aab]/50 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[36rem] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#8ea9c1]/40 bg-white/[0.07] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#add8ff]">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#add8ff] shadow-[0_0_12px_#add8ff]" />
              {t("home.eyebrow")}
            </p>
            <h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-[1.16] tracking-tight sm:text-5xl lg:text-[clamp(3rem,4.2vw,4rem)]">
              <span className="block">{t("home.heroTitle")}</span>
              <span className="block">{t("home.heroSubject")}</span>
              <span className="mt-2 block text-[#add8ff]">{t("home.heroAccent")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#d8e0e8] sm:text-lg">{t("home.heroDescription")}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-full bg-[#add8ff] px-6 text-[#0c263d] hover:bg-white">
                <Link to="/contact">{t("home.contactAction")} <ArrowRightIcon aria-hidden="true" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 rounded-full border-[#8ea9c1]/60 bg-white/[0.06] px-6 text-white hover:bg-white/15 hover:text-white">
                <Link to="/about">{t("home.learnAction")}</Link>
              </Button>
            </div>
            <p className="mt-10 flex items-center gap-3 border-t border-white/15 pt-6 text-sm text-[#d8e0e8]">
              <ShieldCheckIcon className="size-5 shrink-0 text-[#add8ff]" aria-hidden="true" />
              {t("home.heroNote")}
            </p>
          </div>
          <div className="home-hero-visual relative mx-auto w-full max-w-2xl">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-[#add8ff]/20 sm:-inset-4" />
            <img src={heroImage} alt={t("home.heroImageAlt")} width={1536} height={1024} className="relative aspect-[5/4] w-full rounded-[1.5rem] border border-[#8ea9c1]/30 object-cover shadow-2xl shadow-black/30" />
            <div className="absolute -bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl border border-white/20 bg-[#0c263d]/90 px-4 py-3 shadow-xl backdrop-blur-sm sm:left-auto sm:right-7 sm:max-w-xs">
              <BlocksIcon className="size-6 shrink-0 text-[#add8ff]" aria-hidden="true" />
              <p className="text-sm font-medium leading-6">{t("home.heroImageLabel")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d8e0e8] bg-white px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-5 text-sm font-semibold text-[#0c263d] sm:grid-cols-3 sm:gap-8">
          {["home.pillarPassport", "home.pillarTraceability", "home.pillarIndustry"].map((key) => (
            <div key={key} className="flex items-center gap-3 sm:justify-center">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#005aab]" />{t(key)}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#edeff4] px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005aab]">{t("home.benefitsEyebrow")}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0c263d] sm:text-4xl">{t("home.benefitsTitle")}</h2>
            <p className="mt-5 leading-8 text-[#0c263d]/75">{t("home.benefitsIntro")}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <Card key={title} data-reveal className="gap-0 rounded-2xl bg-white py-0 shadow-sm ring-[#d8e0e8] transition-shadow hover:shadow-lg">
                <CardHeader className="px-6 pt-7 pb-0">
                  <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#add8ff] text-[#0c263d]"><Icon className="size-6" aria-hidden="true" /></span>
                  <CardTitle><h3 className="text-xl font-semibold">{t(title)}</h3></CardTitle>
                </CardHeader>
                <CardContent className="px-6 pt-3 pb-7 text-sm leading-7 text-[#0c263d]/70">{t(description)}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div data-reveal className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005aab]">{t("home.workflowEyebrow")}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#0c263d] sm:text-4xl">{t("home.workflowTitle")}</h2>
            <p className="mt-5 max-w-xl leading-8 text-[#0c263d]/75">{t("home.workflowDescription")}</p>
            <ol className="mt-8 space-y-5">
              {(["home.workflowStepOne", "home.workflowStepTwo", "home.workflowStepThree"] as const).map((key, index) => (
                <li key={key} className="flex items-start gap-4 border-b border-[#d8e0e8] pb-5 last:border-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edeff4] text-sm font-bold text-[#005aab]">0{index + 1}</span>
                  <p className="pt-2 font-medium leading-6 text-[#0c263d]">{t(key)}</p>
                </li>
              ))}
            </ol>
            <Button asChild variant="outline" size="lg" className="mt-7 h-11 rounded-full border-[#8ea9c1] px-6 text-[#005aab] hover:bg-[#edeff4]">
              <Link to="/about">{t("home.workflowAction")} <ArrowRightIcon aria-hidden="true" /></Link>
            </Button>
          </div>
          <img src={workflowImage} alt={t("home.workflowImageAlt")} width={1536} height={1024} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" />
        </div>
      </section>

      <section className="bg-[#edeff4] px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#005aab]">{t("home.industriesEyebrow")}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0c263d] sm:text-4xl">{t("home.industriesTitle")}</h2>
              <p className="mt-5 leading-8 text-[#0c263d]/75">{t("home.industriesIntro")}</p>
            </div>
            <Button asChild variant="link" className="w-fit text-[#005aab]">
              <Link to="/industries">{t("home.explore")} <ArrowRightIcon aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {industries.map(({ image, title, description }) => (
              <Card key={title} data-reveal className="gap-0 rounded-2xl bg-white p-0 shadow-sm ring-[#d8e0e8] transition-shadow hover:shadow-lg">
                <img src={image} alt="" width={1536} height={1024} loading="lazy" className="aspect-[3/2] w-full object-cover" />
                <CardHeader className="px-6 pt-6 pb-0"><CardTitle><h3 className="text-xl font-semibold">{t(title)}</h3></CardTitle></CardHeader>
                <CardContent className="px-6 pt-3 pb-7 text-sm leading-7 text-[#0c263d]/70">{t(description)}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div data-reveal className="mx-auto flex max-w-7xl flex-col gap-7 overflow-hidden rounded-2xl bg-gradient-to-r from-[#005aab] to-[#0c263d] p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#add8ff]">DeepTrace</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{t("home.ctaTitle")}</h2>
            <p className="mt-3 leading-7 text-[#d8e0e8]">{t("home.ctaDescription")}</p>
          </div>
          <Button asChild size="lg" className="h-11 rounded-full bg-[#add8ff] px-6 text-[#0c263d] hover:bg-white">
            <Link to="/contact">{t("home.contactAction")} <ArrowRightIcon aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
