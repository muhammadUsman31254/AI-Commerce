"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { productsApi } from "@/lib/api";
import { formatCurrency, getProductStatusVariant } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  images: string[];
  category: string;
  description?: string;
}

export default function ProductTable() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    productsApi.list().then((res) => setProducts(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await productsApi.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          className="input max-w-xs"
          placeholder={t("search_products")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">{t("loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {search ? t("no_search_results") : t("no_products_found")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">
                    📦
                  </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant={getProductStatusVariant(product.status)}>
                    {product.status.replace("_", " ")}
                  </Badge>
                </div>
                {/* Low stock warning */}
                {product.quantity > 0 && product.quantity < 5 && (
                  <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Low stock
                  </div>
                )}
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Out of stock</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                {product.category && (
                  <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-1">
                    {product.category}
                  </p>
                )}
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-base font-bold text-gray-900">{formatCurrency(product.price)}</p>
                    <p className={`text-xs mt-0.5 ${product.quantity < 5 ? "text-amber-600" : "text-gray-400"}`}>
                      {product.quantity} in stock
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                    >
                      {t("edit")}
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
