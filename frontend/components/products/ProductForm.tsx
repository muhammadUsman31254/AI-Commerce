"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ImageUpload from "./ImageUpload";
import { productsApi } from "@/lib/api";

interface ProductFormProps {
  productId?: string;
}

const CATEGORIES = ["Mugs", "Bowls", "Vases", "Plates", "Planters", "Decorative", "Other"];

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    status: "active",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing && productId) {
      productsApi.get(productId).then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          quantity: String(p.quantity),
          category: p.category,
          status: p.status,
        });
        if (p.images?.[0]) setExistingImage(p.images[0]);
      }).catch(() => setError("Failed to load product."));
    }
  }, [productId, isEditing]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAiGenerate = async () => {
    if (!imageFile) {
      alert("Please upload a product photo first.");
      return;
    }
    setAiLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      const res = await productsApi.analyzePhoto(fd);
      const caption = res.data.caption as string | undefined;
      if (caption) {
        setForm((f) => ({ ...f, description: caption }));
      }
    } catch {
      alert("AI analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (isEditing && productId) {
        await productsApi.update(productId, fd);
      } else {
        await productsApi.create(fd);
      }
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input type="text" className="input" placeholder="e.g. Handmade Clay Mug" value={form.name} onChange={set("name")} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
          <input type="number" className="input" placeholder="1200" value={form.price} onChange={set("price")} min={0} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" className="input" placeholder="15" value={form.quantity} onChange={set("quantity")} min={0} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select className="input" value={form.category} onChange={set("category")}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input" value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        )}
      </div>

      <ImageUpload
        onFileChange={setImageFile}
        existingUrl={existingImage}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea rows={3} className="input" placeholder="Describe your product…" value={form.description} onChange={set("description")} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 text-teal-600"
          onClick={handleAiGenerate}
          disabled={aiLoading}
        >
          {aiLoading ? "⏳ Captioning…" : "✨ AI caption from photo"}
        </Button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEditing ? "Save Changes" : "Add Product"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
