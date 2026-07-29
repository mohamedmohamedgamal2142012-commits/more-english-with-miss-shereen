"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getTranslation } from "@/lib/i18n";
import { IoSchool, IoCheckmarkCircle } from "react-icons/io5";

export default function ForgotPasswordPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  const t = (key: string) => getTranslation(lang, key);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-white to-[rgba(79,70,229,0.05)] px-6 py-12 pt-[100px]">
      <div className="w-full max-w-[420px] bg-white rounded-[28px] p-9 shadow-lg border border-border">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg gradient-text mb-6">
            <img src="https://i.ibb.co/C5gmLKTG/Favicon.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            Miss Shereen
          </Link>
          <h2 className="text-2xl font-bold mb-1">{t("forgotTitle")}</h2>
          <p className="text-sm text-text-light">{t("forgotSub")}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-200">{error}</div>
        )}

        {sent ? (
          <div className="text-center">
            <IoCheckmarkCircle className="text-5xl text-primary mx-auto mb-4" />
            <p className="text-sm text-text-light mb-6">Check your email for the reset link</p>
            <Link href="/login" className="text-primary font-semibold hover:underline text-sm">
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-text">{t("email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
            </div>
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300 disabled:opacity-60">
              {loading ? "Sending..." : t("sendCode")}
            </button>
          </form>
        )}

        <p className="text-center mt-5 text-sm">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
