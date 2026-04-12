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

    </div>
  );
}
