"use client";

import { useState } from "react";

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  existingUrl?: string;
}

export default function ImageUpload({ onFileChange, existingUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-400 transition-colors bg-gray-50">
        {preview ? (
          <img src={preview} alt="preview" className="h-full w-full object-contain rounded-xl p-1" />
        ) : (
          <div className="text-center">
            <span className="text-2xl">📷</span>
            <p className="text-sm text-gray-400 mt-1">Click to upload image</p>
            <p className="text-xs text-gray-300">PNG, JPG up to 10MB</p>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}
