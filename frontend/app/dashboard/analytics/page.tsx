"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { analyticsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

type Period = "today" | "week" | "month";

const STATUS_COLORS: Record<string, string> = {
  new: "#60a5fa",
  confirmed: "#34d399",
  shipped: "#fbbf24",
  delivered: "#a78bfa",
  rejected: "#f87171",
};

interface AnalyticsData {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  revenue_chart: { label: string; revenue: number }[];
  orders_by_status: { status: string; count: number }[];
  top_products: { name: string; units_sold: number; revenue: number }[];
  ai_insight: string;
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const PERIOD_LABELS: Record<Period, string> = {
    today: t("period_today"),
    week: t("period_week"),
    month: t("period_month"),
  };

  useEffect(() => {
    setLoading(true);
    analyticsApi.summary(period)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div>
      <PageHeader
        title={t("analytics_title")}
        subtitle={t("sales_performance")}
        action={
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t("total_revenue"), value: data ? formatCurrency(data.total_revenue) : "—" },
          { label: t("total_orders"), value: data?.total_orders ?? "—" },
          { label: t("avg_order_value"), value: data ? formatCurrency(data.average_order_value) : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-400">{t("loading_analytics")}</div>
      ) : !data ? (
        <div className="text-center py-24 text-gray-400">{t("failed_analytics")}</div>
      ) : (
        <div className="space-y-6">
          {/* Revenue chart */}
          <Card>
            <CardHeader><CardTitle>{t("revenue_chart_title")} — {PERIOD_LABELS[period]}</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.revenue_chart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders by status donut */}
            <Card>
              <CardHeader><CardTitle>{t("orders_by_status")}</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.orders_by_status}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.orders_by_status.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#9ca3af"} />
                    ))}
                  </Pie>
                  <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Top products bar chart */}
            <Card>
              <CardHeader><CardTitle>{t("top_selling")}</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.top_products} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v: number) => `${v} units`} />
                  <Bar dataKey="units_sold" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* AI Insights card */}
          {data.ai_insight && (
            <Card className="border-teal-200 bg-teal-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-sm font-semibold text-teal-800 mb-1">{t("ai_insight_label")}</p>
                  <p className="text-sm text-teal-700 leading-relaxed">{data.ai_insight}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
