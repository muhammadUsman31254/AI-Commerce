"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import OrderStatusBadge from "./OrderStatusBadge";
import Button from "@/components/ui/Button";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderItem {
  product_id: string;
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
  rejection_reason?: string;
}

export default function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    ordersApi.get(orderId).then((res) => setOrder(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  const handleConfirm = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await ordersApi.confirm(order.id);
      setOrder((o) => o ? { ...o, status: "confirmed" } : o);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!order) return;
    const reason = prompt("Reason for rejection (optional):");
    setActionLoading(true);
    try {
      await ordersApi.reject(order.id, reason || "");
      setOrder((o) => o ? { ...o, status: "rejected", rejection_reason: reason || "" } : o);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading order…</div>;
  if (!order) return <div className="text-center py-16 text-gray-400">Order not found.</div>;

  const canAct = order.status === "new";

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-1">ORDER #{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-lg font-bold text-gray-900">{order.buyer_name}</p>
            <p className="text-sm text-gray-500">{order.buyer_phone}</p>
            <p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.rejection_reason && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            Rejected: {order.rejection_reason}
          </div>
        )}
      </Card>

      {/* Items */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</h3>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-base font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
        </div>
      </Card>

      {/* Actions */}
      {canAct && (
        <div className="flex gap-3">
          <Button onClick={handleConfirm} disabled={actionLoading}>
            ✓ Confirm Order
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
            ✕ Reject Order
          </Button>
        </div>
      )}

      <Button variant="ghost" onClick={() => router.back()}>← Back to Orders</Button>
    </div>
  );
}
