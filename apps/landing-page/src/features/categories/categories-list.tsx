import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import healthcareImage from "@/assets/images/industries/healthcare.jpg";
import foodAgricultureImage from "@/assets/images/industries/food-agriculture.jpg";
import consumerGoodsImage from "@/assets/images/industries/consumer-goods.jpg";
import { loadCategories } from "./categories-api";
import type { Category } from "./categories-schema";

const categoryImages: Record<string, string> = {
  healthcare: healthcareImage,
  "food-agriculture": foodAgricultureImage,
  "consumer-goods": consumerGoodsImage,
};

export function CategoriesList() {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith("en") ? "en" : "vi";
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();

    loadCategories(controller.signal)
      .then((items) => {
        setCategories(items);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });

    return () => controller.abort();
  }, []);

  if (status === "loading") return <p role="status">{t("home.categoriesLoading")}</p>;
  if (status === "error") return <p role="alert">{t("home.categoriesError")}</p>;
  if (categories.length === 0) return <p>{t("home.categoriesEmpty")}</p>;

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id} className="gap-0 overflow-hidden rounded-2xl bg-white p-0 shadow-sm transition-[box-shadow,transform] motion-safe:hover:-translate-y-1 hover:shadow-lg">
          {categoryImages[category.id] ? (
            <div>
              <img
                src={categoryImages[category.id]}
                alt=""
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          ) : (
            <div aria-hidden="true" className="aspect-[3/2] bg-gradient-to-br from-[#add8ff] to-[#005aab]" />
          )}
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle><h3 className="text-xl font-semibold tracking-tight">{category.title[language]}</h3></CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-6 pt-4 pb-6">
            <p className="flex-1 text-sm leading-7 text-foreground/70">{category.description[language]}</p>
            <details className="group mt-6 border-t border-border pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-primary outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                {t("industries.learnMore")}
                <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="mt-4 rounded-xl border border-[#d8e0e8] bg-[#edeff4] p-4">
                <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <dt className="text-foreground/70">{t("industries.sampleProduct")}</dt>
                    <dd className="mt-1 font-medium text-foreground">{category.sample.product[language]}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground/70">{t("industries.batchCode")}</dt>
                    <dd className="mt-1 font-mono font-medium text-foreground">{category.sample.batchCode}</dd>
                  </div>
                </dl>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">{t("industries.traceableInfo")}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/70">
                {category.highlights[language].map((highlight) => (
                  <li key={highlight} className="flex gap-2"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{highlight}</li>
                ))}
              </ul>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
