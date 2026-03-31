import { useState, useEffect, useCallback, type ReactNode } from "react";
import translations from "../data/translations";
import type { AppLanguage } from "../types/userSettings";
import { LanguageContext } from "./languageContextDef";

const LANG_MAP: Record<AppLanguage, string> = { no: "nb", en: "en" };

export function LanguageProvider({
  children,
  initialLanguage = "no",
}: {
  children: ReactNode;
  initialLanguage?: AppLanguage;
}) {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = LANG_MAP[language];
  }, [language]);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
  }, []);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language] as Record<string, string>;
    const fallback = translations.no as Record<string, string>;
    const root = translations as unknown as Record<string, string>;
    const text = dict[key] || fallback[key] || root[key] || key;

    if (!params) return text;

    return Object.entries(params).reduce(
      (result, [param, value]) => result.replace(`{${param}}`, String(value)),
      text,
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
