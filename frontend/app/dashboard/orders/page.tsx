"use client";

import PageHeader from "@/components/layout/PageHeader";
import OrdersTable from "@/components/orders/OrdersTable";
import { useLanguage } from "@/context/LanguageContext";

export default function OrdersPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t("orders_title")} subtitle={t("manage_orders")} />
      <OrdersTable />
    </div>
  );
}
