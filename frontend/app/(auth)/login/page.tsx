"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
          <p className="text-gray-500 mt-1 text-sm">{t("sign_in_subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">{t("welcome_back_heading")}</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
              <input
                type="email"
                className="input"
                placeholder="seller@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? t("signing_in") : t("sign_in")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("no_account")}{" "}
            <Link href="/register" className="text-teal-600 font-medium hover:underline">
              {t("create_store")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
