"use client";

import PageHeader from "@/components/layout/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import { useLanguage } from "@/context/LanguageContext";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t("edit_product_title")} subtitle={t("edit_product_subtitle")} />
      <ProductForm productId={params.id} />
    </div>
  );
}
