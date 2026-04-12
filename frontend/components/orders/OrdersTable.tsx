"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrderStatusBadge from "./OrderStatusBadge";
import { ordersApi, productsApi } from "@/lib/api";
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
  buyer_phone: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface FormItem {
  product_id: string;
  product_name: string;
  quantity: string;
  price: number;
}

const emptyItem = (): FormItem => ({ product_id: "", product_name: "", quantity: "1", price: 0 });

function AddOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [items, setItems] = useState<FormItem[]>([emptyItem()]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    productsApi.list().then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  const selectProduct = (i: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i
          ? { ...it, product_id: product.id, product_name: product.name, price: product.price }
          : it
      )
    );
  };

  const updateQty = (i: number, value: string) => {
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, quantity: value } : it));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!buyerName.trim() || !buyerPhone.trim()) { setError("Buyer name and phone are required."); return; }
    for (const it of items) {
      if (!it.product_id) { setError("Please select a product for each item."); return; }
      if (!it.quantity || parseInt(it.quantity) < 1) { setError("Quantity must be at least 1."); return; }
    }
    setSaving(true);
    try {
      await ordersApi.create({
        buyer_name: buyerName.trim(),
        buyer_phone: buyerPhone.trim(),
        items: items.map((it) => ({
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: parseInt(it.quantity),
          price: it.price,
        })),
      });
      onCreated();
      onClose();
    } catch {
      setError("Failed to create order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce((sum, it) => sum + it.price * (parseInt(it.quantity) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Add New Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            {/* Buyer info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Name *</label>
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Ahmed Khan"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                <input
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+92-300-1234567"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Order items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Order Items *</label>
                <button type="button" onClick={addItem} className="text-xs text-teal-600 font-medium hover:text-teal-700">
                  + Add Item
                </button>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_60px_80px_20px] gap-2 mb-1 px-1">
                <span className="text-[11px] text-gray-400 font-medium">Product</span>
                <span className="text-[11px] text-gray-400 font-medium">Qty</span>
                <span className="text-[11px] text-gray-400 font-medium">Price</span>
                <span />
              </div>

              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="grid grid-cols-[1fr_60px_80px_20px] gap-2 items-center">
                    <select
                      value={it.product_id}
                      onChange={(e) => selectProduct(i, e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Rs.{p.price}
                        </option>
                      ))}
                    </select>
                    <input
                      value={it.quantity}
                      onChange={(e) => updateQty(i, e.target.value)}
                      type="number"
                      min="1"
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
                    />
                    <div className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-500 bg-gray-50 text-center">
                      {it.price ? `Rs.${it.price}` : "—"}
                    </div>
                    {items.length > 1 ? (
                      <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ) : <span />}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            {total > 0 && (
              <div className="bg-teal-50 rounded-lg px-4 py-2.5 flex justify-between items-center">
                <span className="text-sm text-teal-700 font-medium">Total</span>
                <span className="text-sm font-bold text-teal-700">Rs. {total.toLocaleString()}</span>
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-teal-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : "Add Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrdersTable() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    ordersApi.list(tab === "all" ? undefined : tab)
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [tab]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await ordersApi.delete(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Failed to delete order.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {showModal && (
        <AddOrderModal
          onClose={() => setShowModal(false)}
          onCreated={fetchOrders}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
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

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Add Order
        </button>
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
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t("loading")}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t("no_orders_found")}</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
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
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      title="Delete order"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {deletingId === order.id ? (
                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
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
