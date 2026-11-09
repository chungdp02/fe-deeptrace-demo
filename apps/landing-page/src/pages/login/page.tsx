import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, LockKeyholeIcon, MailIcon, ShieldCheckIcon } from "lucide-react";
import deepTraceLogo from "@/assets/images/deeptrace-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelect } from "@/components/layout/language-select";

export default function LoginPage() {
  const { t } = useTranslation();
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(t("login.demoNotice"));
  }

  return (
    <main className="grid min-h-svh bg-white xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="relative isolate hidden min-h-svh flex-col justify-between overflow-hidden bg-gradient-to-br from-[#005aab] via-[#074a85] to-[#0c263d] px-16 py-14 text-white xl:flex">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-[-16rem] -z-10 size-[38rem] rounded-full bg-[#14a5e5]/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-[-15rem] -z-10 size-[36rem] rounded-full bg-[#add8ff]/15 blur-3xl" />

        <Link to="/" aria-label="DeepTrace - Trang chủ" className="inline-flex w-fit items-center">
          <img src={deepTraceLogo} alt="DeepTrace" width={2170} height={725} className="h-auto w-36 brightness-0 invert sm:w-52" />
        </Link>

        <div className="mx-auto max-w-xl">
          <div className="mb-7 inline-flex size-16 items-center justify-center rounded-2xl border border-white/25 bg-white/10 shadow-lg backdrop-blur">
            <ShieldCheckIcon className="size-8 text-[#add8ff]" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#add8ff]">{t("login.brandEyebrow")}</p>
          <h2 className="mt-4 text-5xl font-semibold leading-tight tracking-tight">
            {t("login.brandTitle")}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-[#d8e0e8]">{t("login.brandDescription")}</p>
          <ul className="mt-8 space-y-4 text-sm text-[#d8e0e8]">
            {["login.benefitOne", "login.benefitTwo", "login.benefitThree"].map((key) => (
              <li key={key} className="flex items-start gap-3">
                <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-[#add8ff]" aria-hidden="true" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[#add8ff]">© {new Date().getFullYear()} DeepTrace</p>
      </section>

      <section className="flex min-h-svh flex-col px-6 py-7 text-[#0c263d] sm:px-12 xl:px-16 xl:py-10">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" className="-ml-3 text-[#52677a] hover:text-[#005aab]">
            <Link to="/"><ArrowLeftIcon aria-hidden="true" />{t("login.back")}</Link>
          </Button>
          <LanguageSelect triggerClassName="w-36" />
        </div>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-10">
          <Link to="/" aria-label="DeepTrace - Trang chủ" className="mb-8 inline-flex w-fit xl:hidden">
            <img src={deepTraceLogo} alt="DeepTrace" width={2170} height={725} className="h-auto w-40" />
          </Link>
          <Card className="border-0 bg-transparent p-0 shadow-none ring-0">
            <CardHeader className="px-0">
              <CardTitle><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("login.title")}</h1></CardTitle>
              <CardDescription className="mt-2 text-base text-[#52677a]">{t("login.description")}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-5">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">{t("login.email")}</Label>
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ea9c1]" aria-hidden="true" />
                    <Input id="email" name="email" type="email" autoComplete="username" placeholder="email@company.com" required className="h-12 border-[#d8e0e8] bg-[#f7f9fb] pl-11 text-base" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold">{t("login.password")}</Label>
                  <div className="relative">
                    <LockKeyholeIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ea9c1]" aria-hidden="true" />
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder={t("login.passwordPlaceholder")} required className="h-12 border-[#d8e0e8] bg-[#f7f9fb] pl-11 pr-12 text-base" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-[#52677a]" aria-label={t(showPassword ? "login.hidePassword" : "login.showPassword")} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
                      {showPassword ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <Link to="/contact" className="text-sm font-medium text-[#005aab] hover:underline">{t("login.forgotPassword")}</Link>
                </div>

                <Button type="submit" size="lg" className="h-12 w-full rounded-xl bg-[#005aab] text-base font-semibold shadow-lg shadow-[#005aab]/20 hover:bg-[#074a85]">
                  {t("login.submit")}
                </Button>
                {notice && <p role="status" className="text-sm text-[#52677a]">{notice}</p>}
              </form>
              <p className="mt-8 text-center text-sm text-[#52677a]">
                {t("login.noAccount")}{" "}
                <Link to="/contact" className="font-semibold text-[#005aab] hover:underline">{t("login.consultation")}</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
