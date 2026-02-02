import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "@/i18n/locales/en/common.json";
import ptCommon from "@/i18n/locales/pt/common.json";

export const LANGUAGE_STORAGE_KEY = "app_language";
export const DEFAULT_LANGUAGE = "pt" as const;
export const SUPPORTED_LANGUAGES = ["pt", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const normalizeLanguage = (value?: string | null): AppLanguage => {
  if (!value) return DEFAULT_LANGUAGE;
  const normalized = value.toLowerCase();
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("pt")) return "pt";
  return DEFAULT_LANGUAGE;
};

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) return normalizeLanguage(saved);
  } catch (error) {
    // Ignore storage errors and fallback to device language.
  }

  const browserLanguage = navigator.languages?.[0] ?? navigator.language;
  return normalizeLanguage(browserLanguage);
};

void i18n.use(initReactI18next).init({
  resources: {
    pt: { common: ptCommon },
    en: { common: enCommon },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

if (typeof window !== "undefined") {
  i18n.on("languageChanged", (nextLanguage) => {
    try {
      const normalized = normalizeLanguage(nextLanguage);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    } catch (error) {
      // Ignore storage errors to keep language changes non-blocking.
    }
  });
}

export { normalizeLanguage };
export default i18n;
