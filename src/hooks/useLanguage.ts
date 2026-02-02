import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import i18n, { DEFAULT_LANGUAGE, type AppLanguage, normalizeLanguage } from "@/i18n";

export const useLanguage = () => {
  const { i18n: i18nInstance } = useTranslation();

  const language = useMemo<AppLanguage>(() => {
    return normalizeLanguage(i18nInstance.resolvedLanguage || i18nInstance.language || DEFAULT_LANGUAGE);
  }, [i18nInstance.language, i18nInstance.resolvedLanguage]);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    const normalized = normalizeLanguage(nextLanguage);
    if (normalized === language) return;
    await i18n.changeLanguage(normalized);
  }, [language]);

  const isEnglish = language === "en";
  const isPortuguese = language === "pt";

  return {
    language,
    isEnglish,
    isPortuguese,
    setLanguage,
  };
};
