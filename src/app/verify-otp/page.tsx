"use client";

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n";
import { IoSchool } from "react-icons/io5";

export default function VerifyOtpPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  const t = (key: string) => getTranslation(lang, key);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      alert("Demo: OTP Verified! Redirecting to reset password...");
      router.push("/login");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-white to-[rgba(79,70,229,0.05)] px-6 py-12 pt-[100px]">
      <div className="w-full max-w-[420px] bg-white rounded-[28px] p-9 shadow-lg border border-border">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg gradient-text mb-6">
            <img src="https://i.ibb.co/C5gmLKTG/Favicon.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            Miss Shereen
          </Link>
          <h2 className="text-2xl font-bold mb-1">{t("otpTitle")}</h2>
          <p className="text-sm text-text-light">{t("otpSub")}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-200">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-lg font-semibold border border-border rounded-xl bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]"
              />
            ))}
          </div>

          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300 disabled:opacity-60">
            {loading ? "Verifying..." : t("verify")}
          </button>
        </form>

        <p className="text-center mt-5 text-sm">
          <button onClick={() => alert("Demo: Resend Code")} className="text-primary font-semibold hover:underline bg-transparent border-none cursor-pointer text-sm">
            {t("resend")}
          </button>
        </p>
      </div>
    </div>
  );
}
