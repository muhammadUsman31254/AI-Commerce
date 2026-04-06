"use client";

import PageHeader from "@/components/layout/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import { useLanguage } from "@/context/LanguageContext";

export default function AddProductPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t("add_product_title")} subtitle={t("add_product_subtitle")} />
      <ProductForm />
    </div>
  );
}
