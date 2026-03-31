import { useContext } from "react";
import { LanguageContext } from "../context/languageContextDef";

export function useTranslation() {
  return useContext(LanguageContext);
}
