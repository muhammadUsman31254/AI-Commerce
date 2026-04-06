"use client";

import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useChatContext } from "@/context/ChatContext";

export default function Topbar() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isOpen, togglePanel } = useChatContext();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        {/* Chat panel toggle */}
        <button
          onClick={togglePanel}
          title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-sm font-medium ${
            isOpen
              ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.671 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">{t("chat_title")}</span>
        </button>

        <LanguageToggle />

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200" />

        {/* Store badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
            CC
          </div>
          <span className="text-sm font-medium text-gray-700">Clay &amp; Craft</span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          {t("sign_out")}
        </button>
      </div>
    </header>
  );
}
