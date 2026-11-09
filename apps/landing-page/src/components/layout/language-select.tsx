import { useTranslation } from "react-i18next";
import { Globe2Icon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LanguageSelectProps = {
  triggerClassName?: string;
  compact?: boolean;
};

export function LanguageSelect({ triggerClassName, compact = false }: LanguageSelectProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith("en") ? "en" : "vi";

  return (
    <Select value={language} onValueChange={(value) => void i18n.changeLanguage(value)}>
      <SelectTrigger size="sm" className={triggerClassName} aria-label={t("nav.language")}>
        <Globe2Icon className="size-4 text-primary" aria-hidden="true" />
        <SelectValue>{compact ? language.toUpperCase() : language === "vi" ? "Tiếng Việt" : "English"}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        <SelectItem value="vi">Tiếng Việt</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
}
