"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      title={lang === "en" ? "Switch to Urdu" : "Switch to English"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors ${className}`}
    >
      <span className="text-base leading-none">{lang === "en" ? "🇵🇰" : "🇬🇧"}</span>
      <span>{lang === "en" ? "اردو" : "English"}</span>
    </button>
  );
}
