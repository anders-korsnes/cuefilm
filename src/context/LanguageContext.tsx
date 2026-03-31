import { useState, type ReactNode } from "react";
import translations from "../data/translations";
import type { AppLanguage } from "../types/userSettings";
import { LanguageContext } from "./languageContextDef";

export function LanguageProvider({
  children,
  initialLanguage = "no",
}: {
  children: ReactNode;
  initialLanguage?: AppLanguage;
}) {
  const [language, setLanguage] = useState<AppLanguage>(initialLanguage);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language] as Record<string, string>;
    const fallback = translations.no as Record<string, string>;
    const root = translations as Record<string, string>;
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
