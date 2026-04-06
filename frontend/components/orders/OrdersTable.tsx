"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrderStatusBadge from "./OrderStatusBadge";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const TABS = ["all", "new", "confirmed", "shipped", "delivered", "rejected"] as const;
type Tab = (typeof TABS)[number];

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  buyer_name: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
}

export default function OrdersTable() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi.list(tab === "all" ? undefined : tab)
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
              tab === tabKey ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabKey === "all" ? t("tab_all") : tabKey}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_order_id")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_buyer")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_items")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_total")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_date")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t("loading")}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t("no_orders_found")}</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-teal-600 hover:underline">
                      #{order.id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.buyer_name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                    {order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
