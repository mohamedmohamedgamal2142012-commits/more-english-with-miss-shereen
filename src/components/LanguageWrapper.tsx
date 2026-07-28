"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Lang } from "@/lib/i18n";

interface LanguageWrapperProps {
  children: ReactNode;
}

export default function LanguageWrapper({ children }: LanguageWrapperProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lang") as Lang;
    if (saved && (saved === "en" || saved === "ar")) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (lang === "ar") {
      html.setAttribute("lang", "ar");
      html.setAttribute("dir", "rtl");
    } else {
      html.setAttribute("lang", "en");
      html.setAttribute("dir", "ltr");
    }
    localStorage.setItem("lang", lang);
  }, [lang, mounted]);

  const handleLanguageChange = (newLang: Lang) => {
    setLang(newLang);
  };

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: lang === "ar" ? "var(--font-cairo), 'Cairo', sans-serif" : "var(--font-poppins), 'Poppins', sans-serif" }}>
      <Navbar lang={lang} onLanguageChange={handleLanguageChange} />
      <main className="flex-1">{children}</main>
      {!isDashboard && <Footer lang={lang} />}
    </div>
  );
}
