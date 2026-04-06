"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { inventoryApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  status: string;
}

export default function InventoryPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    inventoryApi.list()
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleQtyChange = (id: string, val: string) => {
    setEditing((prev) => ({ ...prev, [id]: Number(val) }));
  };

  const handleSave = async (id: string) => {
    const qty = editing[id];
    if (qty === undefined) return;
    setSaving(id);
    try {
      await inventoryApi.updateStock(id, qty);
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, quantity: qty } : p)
      );
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      alert("Failed to update stock.");
    } finally {
      setSaving(null);
    }
  };

  const isLowStock = (qty: number) => qty < 5;

  return (
    <div>
      <PageHeader title={t("inventory_title")} subtitle={t("monitor_stock")} />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t("total_products"), value: products.length },
          { label: t("low_stock_count"), value: products.filter((p) => isLowStock(p.quantity)).length, warn: true },
          { label: t("out_of_stock"), value: products.filter((p) => p.quantity === 0).length, warn: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.warn && stat.value > 0 ? "text-amber-600" : "text-gray-900"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_product")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_category")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_price")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_stock_level")}</th>
              <th className="text-start px-4 py-3 text-gray-500 font-medium">{t("col_update_stock")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t("loading")}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t("no_products")}</td></tr>
            ) : (
              products.map((product) => {
                const low = isLowStock(product.quantity);
                const currentQty = editing[product.id] ?? product.quantity;
                const isDirty = editing[product.id] !== undefined;

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-gray-500">{product.category || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${product.quantity === 0 ? "text-red-600" : low ? "text-amber-600" : "text-green-600"}`}>
                          {product.quantity}
                        </span>
                        {product.quantity === 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{t("out_of_stock_badge")}</span>
                        )}
                        {low && product.quantity > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">{t("low_badge")}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={currentQty}
                          onChange={(e) => handleQtyChange(product.id, e.target.value)}
                          className="input w-20 text-center"
                        />
                        {isDirty && (
                          <button
                            onClick={() => handleSave(product.id)}
                            disabled={saving === product.id}
                            className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                          >
                            {saving === product.id ? "…" : t("save")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
