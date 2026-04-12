"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    store_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 border border-teal-100">
              <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="16" y="16" width="32" height="32" rx="6" stroke="#0d9488" strokeWidth="2" fill="#ccfbf1" />
                <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0d9488" fontFamily="monospace">AI</text>
                <line x1="16" y1="24" x2="8"  y2="24" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="16" y1="32" x2="8"  y2="32" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="16" y1="40" x2="8"  y2="40" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="48" y1="24" x2="56" y2="24" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="48" y1="32" x2="56" y2="32" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="48" y1="40" x2="56" y2="40" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="24" y1="16" x2="24" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
                <line x1="32" y1="16" x2="32" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
                <line x1="40" y1="16" x2="40" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
                <line x1="24" y1="48" x2="24" y2="56" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="32" y1="48" x2="32" y2="56" stroke="#0d9488" strokeWidth="1.5" />
                <line x1="40" y1="48" x2="40" y2="56" stroke="#0d9488" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-wide">
              <span className="text-teal-600">AI-</span><span className="text-gray-800">Commerce</span>
            </span>
          </div>
          <p className="text-gray-500 mt-1 text-sm">{t("create_account_subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">{t("setup_store")}</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("full_name")}</label>
              <input type="text" className="input" placeholder="Your name" value={form.name} onChange={set("name")} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("store_name")}</label>
              <input type="text" className="input" placeholder="e.g. Clay & Craft" value={form.store_name} onChange={set("store_name")} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("phone")}</label>
              <input type="tel" className="input" placeholder="+92-xxx-xxxxxxx" value={form.phone} onChange={set("phone")} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
              <input type="email" className="input" placeholder="seller@example.com" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
              <input type="password" className="input" placeholder={t("min_chars")} value={form.password} onChange={set("password")} minLength={8} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? t("creating_account") : t("create_account")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("already_account")}{" "}
            <Link href="/login" className="text-teal-600 font-medium hover:underline">
              {t("sign_in")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
