"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { type TranslationKey } from "@/lib/i18n";

const navItems: { labelKey: TranslationKey; href: string; icon: string }[] = [
  { labelKey: "nav_dashboard", href: "/dashboard", icon: "🏠" },
  { labelKey: "nav_products", href: "/dashboard/products", icon: "📦" },
  { labelKey: "nav_orders", href: "/dashboard/orders", icon: "🛒" },
  { labelKey: "nav_inventory", href: "/dashboard/inventory", icon: "📋" },
  { labelKey: "nav_analytics", href: "/dashboard/analytics", icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="w-60 bg-white border-e border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-teal-600">AI-Commerce</span>
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

      {/* Store info */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">{t("logged_in_as")}</p>
        <p className="text-sm font-semibold text-gray-700">Clay &amp; Craft</p>
      </div>
    </aside>
  );
}
