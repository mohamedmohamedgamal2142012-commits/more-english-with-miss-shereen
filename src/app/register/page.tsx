"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getTranslation } from "@/lib/i18n";
import { IoSchool } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, signInWithGoogle, user, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (user && userRole) {
      router.push(`/dashboard/${userRole}`);
    }
  }, [user, userRole, router]);

  const t = (key: string) => getTranslation(lang, key);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name, phone);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-white to-[rgba(79,70,229,0.05)] px-6 py-12 pt-[100px]">
      <div className="w-full max-w-[420px] bg-white rounded-[28px] p-9 shadow-lg border border-border">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg gradient-text mb-6">
            <IoSchool className="text-primary text-xl" />
            Miss Shereen
          </Link>
          <h2 className="text-2xl font-bold mb-1">{t("regTitle")}</h2>
          <p className="text-sm text-text-light">{t("regSub")}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">{t("fullName")}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">{t("email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">{t("phone")}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 100 123 4567" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">{t("password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">{t("confirmPass")}</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
          </div>
          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300 disabled:opacity-60">
            {loading ? "Loading..." : t("createAccount")}
          </button>
        </form>

        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-text-lighter">{t("or")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 border border-border rounded-xl bg-white text-sm font-medium transition-all duration-300 hover:bg-bg hover:border-primary cursor-pointer disabled:opacity-60">
          <FcGoogle className="text-lg" />
          {t("googleSignUp")}
        </button>

        <p className="text-center mt-5 text-sm text-text-light">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t("navSignIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
