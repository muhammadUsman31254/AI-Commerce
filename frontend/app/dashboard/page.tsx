"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import PageHeader from "@/components/layout/PageHeader";
import { analyticsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Summary {
  total_revenue: number;
  total_orders: number;
  active_products: number;
  low_stock_count: number;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    analyticsApi.summary("today")
      .then((res) => setSummary(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title={t("dashboard_title")} subtitle={t("welcome_back")} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title={t("total_revenue")} value={summary ? formatCurrency(summary.total_revenue) : "—"} icon="💰" />
        <StatsCard title={t("total_orders")} value={summary?.total_orders ?? "—"} icon="🛒" />
        <StatsCard title={t("active_products")} value={summary?.active_products ?? "—"} icon="📦" />
        <StatsCard title={t("low_stock_alerts")} value={summary?.low_stock_count ?? "—"} icon="⚠️" variant="warning" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div>
          <LowStockAlert />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">{t("quick_actions")}</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/products/add" className="btn-primary">{t("add_product")}</Link>
          <Link href="/dashboard/orders" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">{t("view_orders")}</Link>
          <Link href="/dashboard/analytics" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">{t("check_analytics")}</Link>
        </div>
      </div>
    </div>
  );
}
