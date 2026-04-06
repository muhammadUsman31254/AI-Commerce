"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations, type Lang, type TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggle: () => {},
  t: (key) => translations.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Restore persisted preference on mount and apply to <html>
  useEffect(() => {
    const stored = (localStorage.getItem("lang") as Lang) || "en";
    setLang(stored);
    applyToHtml(stored);
  }, []);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "ur" : "en";
      localStorage.setItem("lang", next);
      applyToHtml(next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[lang][key] as string,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

function applyToHtml(lang: Lang) {
  const html = document.documentElement;
  if (lang === "ur") {
    html.classList.add("lang-urdu");
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "ur");
  } else {
    html.classList.remove("lang-urdu");
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", "en");
  }
}

export function useLanguage() {
  return useContext(LanguageContext);
}
