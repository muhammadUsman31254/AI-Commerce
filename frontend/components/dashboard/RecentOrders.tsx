"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate, getOrderStatusVariant } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Order {
  id: string;
  buyer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: { product_name: string; quantity: number }[];
}

export default function RecentOrders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list("all").then((res) => {
      setOrders(res.data.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("recent_orders")}</CardTitle>
          <Link href="/dashboard/orders" className="text-sm text-teal-600 hover:underline">
            {t("view_all")}
          </Link>
        </div>
      </CardHeader>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">{t("loading")}</div>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">{t("no_orders_yet")}</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-5 px-5 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{order.buyer_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                <Badge variant={getOrderStatusVariant(order.status)} className="mt-1">
                  {order.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
