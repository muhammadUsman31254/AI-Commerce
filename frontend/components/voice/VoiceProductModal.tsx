"use client";

import { useState, useRef, useCallback } from "react";
import { useChatContext } from "@/context/ChatContext";
import { productsApi } from "@/lib/api";

export default function VoiceProductModal() {
  const { pendingProduct, clearPendingProduct, pushMessages } = useChatContext();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync fields when pendingProduct changes
  const prevPending = useRef<typeof pendingProduct>(null);
  if (pendingProduct && pendingProduct !== prevPending.current) {
    prevPending.current = pendingProduct;
    setName(pendingProduct.name ?? "");
    setPrice(String(pendingProduct.price ?? ""));
    setQuantity(String(pendingProduct.quantity ?? ""));
    setCategory(pendingProduct.category ?? "");
    setImageFile(null);
    setPreview(null);
    setError("");
  }

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async () => {
    if (!imageFile) { setError("Photo select karein."); return; }
    if (!name || !price || !quantity) { setError("Naam, price aur quantity required hai."); return; }

    setSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("price", price);
      form.append("quantity", quantity);
      form.append("category", category);
      form.append("image", imageFile);

      await productsApi.voiceAdd(form);

      pushMessages([{
        id: `va-${Date.now()}`,
        role: "assistant",
        content: `✅ "${name}" store mein add ho gaya! Price: Rs.${price}, Stock: ${quantity} pieces. Description Gemini ne automatically generate ki.`,
      }]);
      clearPendingProduct();
    } catch {
      setError("Product add nahi ho saka. Dobara koshish karein.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!pendingProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Product Photo Upload</h2>
            <p className="text-sm text-gray-500 mt-0.5">Photo se description automatically ban jayegi</p>
          </div>
          <button
            onClick={clearPendingProduct}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Image picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${preview ? "border-teal-300" : "border-gray-200 hover:border-teal-300"}`}
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <span className="text-4xl mb-2">📷</span>
                <p className="text-sm font-medium">Product ki photo yahan upload karein</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Handmade Clay Mug"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price (Rs.)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="1500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="10"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Category (optional)</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Mugs"
              />
            </div>
          </div>

          {/* Gemini note */}
          <p className="text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2">
            ✨ Gemini AI photo dekh kar automatically description likhega
          </p>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={clearPendingProduct}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !imageFile}
            className="flex-1 bg-teal-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
