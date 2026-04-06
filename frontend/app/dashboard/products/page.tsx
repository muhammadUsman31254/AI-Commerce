"use client";

import PageHeader from "@/components/layout/PageHeader";
import ProductTable from "@/components/products/ProductTable";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductsPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader
        title={t("products_title")}
        subtitle={t("manage_catalogue")}
        action={
          <Link href="/dashboard/products/add" className="btn-primary">
            {t("add_product")}
          </Link>
        }
      />
      <ProductTable />
    </div>
  );
}
