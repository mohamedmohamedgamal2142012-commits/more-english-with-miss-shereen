"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ADMIN_EMAIL } from "@/contexts/AuthContext";
import { getTranslation } from "@/lib/i18n";
import { IoSchool, IoCheckmarkCircle } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register, signInWithGoogle, user, userRole, userStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (user && userRole && userStatus) {
      if (userRole === "admin" || userStatus === "active") {
        router.push(`/dashboard/${userRole}`);
      }
    }
  }, [user, userRole, userStatus, router]);

  const t = (key: string) => getTranslation(lang, key);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
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
      if (parentName && parentPhone) {
        setStep(2);
      } else {
        setLoading(true);
        try {
          await register(email, password, name, phone, parentName, parentPhone);
          const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          if (!isAdmin) {
            setRegistered(true);
          }
        } catch (err: any) {
          setError(err.message || "Failed to create account");
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, phone, parentName, parentPhone);
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      if (!isAdmin) {
        setRegistered(true);
      }
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

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-white to-[rgba(79,70,229,0.05)] px-6 py-12 pt-[100px]">
        <div className="w-full max-w-[480px] bg-white rounded-[28px] p-9 shadow-lg border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <IoCheckmarkCircle className="text-3xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {lang === "ar" ? "تم التسجيل بنجاح" : "Registration Successful"}
          </h2>
          <p className="text-text-light mb-6 leading-relaxed">
            {lang === "ar"
              ? "حسابك قيد المراجعة من الإدارة. سنرسل لك إشعارًا عندما يتم الموافقة على حسابك. يمكنك تسجيل الدخول بعد الموافقة."
              : "Your account is pending admin approval. You will be notified once your account is approved. You can log in after approval."}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300"
          >
            {t("navSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-white to-[rgba(79,70,229,0.05)] px-6 py-12 pt-[100px]">
      <div className="w-full max-w-[420px] bg-white rounded-[28px] p-9 shadow-lg border border-border">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg gradient-text mb-6">
            <img src="https://i.ibb.co/C5gmLKTG/Favicon.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
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
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-text">{t("fullName")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === "ar" ? "الاسم الكامل" : "Your Name"} className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
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
                <label className="block text-sm font-medium mb-1.5 text-text">{t("parentName")}</label>
                <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder={lang === "ar" ? "اسم ولي الأمر" : "Parent Name"} className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-text">{t("parentPhone")}</label>
                <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder={lang === "ar" ? "رقم ولي الأمر" : "Parent Phone"} className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-text">{t("password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-text">{t("confirmPass")}</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]" />
              </div>
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300">
                {lang === "ar" ? "التالي" : "Next"}
              </button>
            </>
          ) : (
            <>
              <div className="bg-primary-bg rounded-2xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold mb-4 text-center">
                  {lang === "ar" ? "تأكيد بيانات ولي الأمر" : "Confirm Parent Information"}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-text-light text-sm">{t("parentName")}</span>
                    <span className="font-semibold">{parentName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-text-light text-sm">{t("parentPhone")}</span>
                    <span className="font-semibold" dir="ltr">{parentPhone}</span>
                  </div>
                </div>
                <p className="text-sm text-text-light text-center mt-4">
                  {lang === "ar"
                    ? "يرجى التأكد من صحة بيانات ولي الأمر"
                    : "Please verify the parent information is correct"}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm border-2 border-border bg-white text-text hover:bg-bg transition-all duration-300">
                  {lang === "ar" ? "تعديل" : "Edit"}
                </button>
                <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300 disabled:opacity-60">
                  {loading ? "Loading..." : lang === "ar" ? "تأكيد" : "Confirm"}
                </button>
              </div>
            </>
          )}
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
