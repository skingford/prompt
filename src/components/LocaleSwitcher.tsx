import { useTranslation } from "react-i18next";
import { LOCALE_OPTIONS, type AppLocale } from "../locales/resources";

export function LocaleSwitcher({
  className,
}: {
  className?: string;
}) {
  const { i18n, t } = useTranslation("common");
  const activeLanguage = (LOCALE_OPTIONS.some((option) => option.code === i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : "zh-CN") as AppLocale;

  return (
    <div
      className={["locale-switch", className ?? ""].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("common:language")}
    >
      {LOCALE_OPTIONS.map((option) => {
        const active = option.code === activeLanguage;
        return (
          <button
            key={option.code}
            type="button"
            className={`locale-switch__button ${active ? "is-active" : ""}`}
            onClick={() => {
              void i18n.changeLanguage(option.code);
            }}
            aria-pressed={active}
          >
            {t(`common:locales.${option.code}`)}
          </button>
        );
      })}
    </div>
  );
}
