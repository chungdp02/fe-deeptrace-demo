import { ArrowUpRightIcon, MapPinIcon, MessageSquareTextIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";
import { ContactForm } from "@/features/contact/contact-form";
import { contactPhoneLabel, contactPhoneNumber } from "@/lib/contact-info";

export default function ContactPage() {
  const { t } = useTranslation();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t("footer.address"))}`;

  return (
    <main className="flex-1 bg-[#f7f9fc]">
      <PageBanner title={t("nav.contact")} subtitle={t("contactPage.subtitle")} />

      <section aria-label={t("contactPage.channelsTitle")} className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("contactPage.channelsEyebrow")}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{t("contactPage.channelsTitle")}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Card data-reveal className="bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#e9f3ff] text-primary"><MapPinIcon aria-hidden="true" /></div>
              <CardTitle className="text-lg">{t("contactPage.addressTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-5">
              <address className="text-sm leading-7 text-[#52677a] not-italic">{t("footer.address")}</address>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t("contactPage.openMaps")} <ArrowUpRightIcon className="size-4" aria-hidden="true" />
              </a>
            </CardContent>
          </Card>

          <Card data-reveal className="bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#e9f3ff] text-primary"><PhoneIcon aria-hidden="true" /></div>
              <CardTitle className="text-lg">{t("contactPage.phoneTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-5">
              <div>
                <a href={`tel:${contactPhoneNumber}`} className="text-lg font-semibold text-foreground hover:text-primary">{contactPhoneLabel}</a>
                <p className="mt-2 text-sm leading-6 text-[#52677a]">{t("contactPage.phoneDescription")}</p>
              </div>
              <a href={`tel:${contactPhoneNumber}`} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t("contactPage.callNow")} <ArrowUpRightIcon className="size-4" aria-hidden="true" />
              </a>
            </CardContent>
          </Card>

          <Card data-reveal className="bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#e9f3ff] text-primary"><MessageSquareTextIcon aria-hidden="true" /></div>
              <CardTitle className="text-lg">{t("contactPage.requestTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-5">
              <p className="text-sm leading-7 text-[#52677a]">{t("contactPage.requestDescription")}</p>
              <a href="#contact-form" className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {t("contactPage.toForm")} <ArrowUpRightIcon className="size-4" aria-hidden="true" />
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-[#d8e0e8] bg-white px-6 py-14 sm:py-20">
        <div data-reveal className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#005aab] to-[#0c263d] p-8 text-white sm:p-10 lg:sticky lg:top-28">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border border-white/15" />
            <div className="relative">
              <div className="mb-8 flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/10"><ShieldCheckIcon aria-hidden="true" /></div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#add8ff]">{t("contactPage.introEyebrow")}</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{t("contactPage.introTitle")}</h2>
              <p className="mt-5 text-sm leading-7 text-[#d8e0e8]">{t("contactPage.introDescription")}</p>
              <div className="mt-8 border-t border-white/20 pt-7">
                <p className="text-sm text-[#d8e0e8]">{t("contactPage.directContact")}</p>
                <a href={`tel:${contactPhoneNumber}`} className="mt-2 inline-flex items-center gap-2 text-lg font-semibold hover:text-[#add8ff]"><PhoneIcon className="size-4" aria-hidden="true" />{contactPhoneLabel}</a>
              </div>
            </div>
          </div>

          <Card className="bg-[#f7f9fc] p-2 shadow-sm sm:p-4">
            <CardHeader>
              <CardTitle className="text-2xl">{t("contactPage.formTitle")}</CardTitle>
              <CardDescription className="mt-1 leading-6">{t("contactPage.formDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
              <p className="mt-5 text-xs leading-5 text-muted-foreground">{t("contactPage.note")}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
