"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { inventoryApi } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
  id: string;
  name: string;
  quantity: number;
}

export default function LowStockAlert() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.list().then((res) => {
      const low = res.data.filter((p: Product) => p.quantity < 5);
      setItems(low);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("low_stock")}</CardTitle>
          <Link href="/dashboard/inventory" className="text-sm text-teal-600 hover:underline">
            {t("manage")}
          </Link>
        </div>
      </CardHeader>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">{t("loading")}</div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">{t("all_products_stocked")}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <p className="text-sm text-gray-700 truncate max-w-[160px]">{item.name}</p>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {item.quantity} {t("left")}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
