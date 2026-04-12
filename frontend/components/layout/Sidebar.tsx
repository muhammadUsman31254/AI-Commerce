"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";
import { removeToken } from "@/lib/auth";

const navItems: { labelKey: TranslationKey; href: string; icon: string }[] = [
  { labelKey: "nav_dashboard", href: "/dashboard", icon: "🏠" },
  { labelKey: "nav_products", href: "/dashboard/products", icon: "📦" },
  { labelKey: "nav_orders", href: "/dashboard/orders", icon: "🛒" },
  { labelKey: "nav_inventory", href: "/dashboard/inventory", icon: "📋" },
  { labelKey: "nav_analytics", href: "/dashboard/analytics", icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <aside className="w-60 bg-white border-e border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-50 border border-teal-100">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="16" y="16" width="32" height="32" rx="6" stroke="#0d9488" strokeWidth="2" fill="#ccfbf1" />
              <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0d9488" fontFamily="monospace">AI</text>
              <line x1="16" y1="24" x2="8"  y2="24" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="16" y1="32" x2="8"  y2="32" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="16" y1="40" x2="8"  y2="40" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="48" y1="24" x2="56" y2="24" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="48" y1="32" x2="56" y2="32" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="48" y1="40" x2="56" y2="40" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="24" y1="16" x2="24" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
              <line x1="32" y1="16" x2="32" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
              <line x1="40" y1="16" x2="40" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
              <line x1="24" y1="48" x2="24" y2="56" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="32" y1="48" x2="32" y2="56" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="40" y1="48" x2="40" y2="56" stroke="#0d9488" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wide">
            <span className="text-teal-600">AI-</span><span className="text-gray-800">Commerce</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span>{item.icon}</span>
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.048a.75.75 0 1 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L8.704 10.75H18.25A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
          </svg>
          {t("sign_out")}
        </button>
      </div>
    </aside>
  );
}
