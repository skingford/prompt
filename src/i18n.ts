import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  LOCALE_STORAGE_KEY,
  LOCALE_OPTIONS,
  resources,
} from "./locales/resources";

const supportedLngs = LOCALE_OPTIONS.map((option) => option.code);
const savedLanguage =
  typeof window !== "undefined"
    ? window.localStorage.getItem(LOCALE_STORAGE_KEY)
    : null;

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage ?? DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs,
    defaultNS: "common",
    ns: ["common", "login", "workbench"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ["localStorage"],
    },
  })
  .then(() => {
    syncDocumentLanguage(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
  });

i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
export { DEFAULT_LANGUAGE, LOCALE_OPTIONS, LOCALE_STORAGE_KEY };
