import { createContext } from "react";
import type { AppLanguage } from "../types/userSettings";

export type LanguageContextType = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "no",
  setLanguage: () => {},
  t: (key) => key,
});
