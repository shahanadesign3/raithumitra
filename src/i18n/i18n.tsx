import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "te" | "hi" | "mr" | "ta" | "kn";

type Dict = Record<string, any>;

import en from "./locales/en";
import te from "./locales/te";
import hi from "./locales/hi";
import mr from "./locales/mr";
import ta from "./locales/ta";
import kn from "./locales/kn";

const dictionaries: Record<Lang, Dict> = { en, te, hi, mr, ta, kn };

function interpolate(str: string, params?: Record<string, any>) {
  if (!params) return str;
  return str.replace(/\{(.*?)\}/g, (_, k) => (params[k] ?? `{${k}}`).toString());
}

function getPath(dict: Dict, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), dict);
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("appLang") as Lang) || "en");

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("appLang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, any>) => {
      const value = getPath(dictionaries[lang], key) ?? getPath(dictionaries.en, key) ?? key;
      if (typeof value === "string") return interpolate(value, params);
      return key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
