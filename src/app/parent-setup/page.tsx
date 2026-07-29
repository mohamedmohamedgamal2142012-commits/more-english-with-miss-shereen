"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getTranslation } from "@/lib/i18n";
import { IoSchool, IoSave } from "react-icons/io5";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ParentSetupPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, userRole, userStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (!user || userRole !== "student") {
      router.push("/login");
    }
  }, [user, userRole, router]);

  const t = (key: string) => getTranslation(lang, key);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!parentName || !parentPhone) {
      setError("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      const snap = await getDoc(doc(db, "users", user!.uid));
      if (snap.exists()) {
        await updateDoc(doc(db, "users", user!.uid), {
          parentName,
          parentPhone,
          updatedAt: serverTimestamp(),
        });
      }
      router.push("/dashboard/student");
    } catch (err: any) {
      setError(err.message || "Failed to save parent data");
    } finally {
      setSaving(false);
    }
  };

  if (!user || userRole !== "student") {
    return <div className="min-h-screen flex items-center justify-center bg-bg"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg via-white to-[rgba(79,70,229,0.05)] px-6 py-12 pt-[100px]">
      <div className="w-full max-w-[420px] bg-white rounded-[28px] p-9 shadow-lg border border-border">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg gradient-text mb-6">
            <IoSchool className="text-primary text-xl" />
            Miss Shereen
          </Link>
          <h2 className="text-2xl font-bold mb-1">{t("parentDataTitle")}</h2>
          <p className="text-sm text-text-light">{t("parentDataSub")}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">{t("parentName")}</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder={lang === "ar" ? "اسم ولي الأمر" : "Parent Name"}
              className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">{t("parentPhone")}</label>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder={lang === "ar" ? "رقم ولي الأمر" : "Parent Phone"}
              className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,191,166,0.1)]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300 disabled:opacity-60"
          >
            {saving ? "Saving..." : <><IoSave /> {t("saveParentData")}</>}
          </button>
        </form>
      </div>
    </div>
  );
}