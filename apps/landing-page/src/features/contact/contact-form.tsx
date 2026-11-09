import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContactSchema, type ContactValues } from "./contact-schema";

export function ContactForm() {
  const { t } = useTranslation();
  const [notice, setNotice] = useState("");
  const schema = createContactSchema({
    name: t("contact.nameError"),
    email: t("contact.emailError"),
    phone: t("contact.phoneError"),
    message: t("contact.messageError"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", organization: "", email: "", phone: "", message: "" },
  });

  return (
    <form
      id="contact-form"
      className="scroll-mt-28 space-y-6"
      noValidate
      onChange={() => setNotice("")}
      onSubmit={handleSubmit(() => setNotice(t("contact.demoNotice")))}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">{t("contact.name")}</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder={t("contact.namePlaceholder")}
            className=" bg-white"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && <p id="contact-name-error" role="alert" className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-organization">{t("contact.organization")} <span className="font-normal text-muted-foreground">({t("contact.optional")})</span></Label>
          <Input
            id="contact-organization"
            autoComplete="organization"
            placeholder={t("contact.organizationPlaceholder")}
            className="h-11 bg-white"
            {...register("organization")}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-email">{t("contact.email")}</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="email@company.com"
            className="h-11 bg-white"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && <p id="contact-email-error" role="alert" className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">{t("contact.phone")} <span className="font-normal text-muted-foreground">({t("contact.optional")})</span></Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            placeholder={t("contact.phonePlaceholder")}
            className="h-11 bg-white"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            {...register("phone")}
          />
          {errors.phone && <p id="contact-phone-error" role="alert" className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("contact.message")}</Label>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder={t("contact.messagePlaceholder")}
          className="min-h-32 bg-white"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          {...register("message")}
        />
        {errors.message && <p id="contact-message-error" role="alert" className="text-sm text-destructive">{errors.message.message}</p>}
      </div>
      <Button type="submit" size="lg" className="h-11 w-full px-8 sm:w-auto">{t("contact.submit")}</Button>
      {notice && <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">{notice}</p>}
    </form>
  );
}
