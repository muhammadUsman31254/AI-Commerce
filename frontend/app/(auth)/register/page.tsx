"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import VoiceRegister from "@/components/auth/VoiceRegister";

const Logo = () => (
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
);

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"choose" | "manual" | "voice">("choose");
  const [form, setForm] = useState({ name: "", email: "", password: "", store_name: "", phone: "" });
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

        {/* Logo */}
        <div className="text-center mb-8">
          <Logo />
          <p className="text-gray-500 mt-1 text-sm">{t("create_account_subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Choose mode ── */}
          {mode === "choose" && (
            <div className="space-y-4">
              <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">{t("setup_store")}</h1>

              {/* Voice option */}
              <button
                onClick={() => setMode("voice")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                    <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Register with Voice</p>
                  <p className="text-xs text-teal-600 mt-0.5">Answer questions in Urdu step by step</p>
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Manual option */}
              <button
                onClick={() => setMode("manual")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
                    <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Register Manually</p>
                  <p className="text-xs text-gray-500 mt-0.5">Fill in the form fields yourself</p>
                </div>
              </button>
            </div>
          )}

          {/* ── Voice mode ── */}
          {mode === "voice" && (
            <VoiceRegister onCancel={() => setMode("choose")} />
          )}

          {/* ── Manual mode ── */}
          {mode === "manual" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode("choose")} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-gray-900">{t("setup_store")}</h1>
              </div>

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
            </div>
          )}

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
