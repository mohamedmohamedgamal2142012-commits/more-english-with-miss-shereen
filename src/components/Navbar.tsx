"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoLanguage, IoMenu, IoClose } from "react-icons/io5";
import { getTranslation, Lang } from "@/lib/i18n";

interface NavbarProps {
  lang: Lang;
  onLanguageChange: (lang: Lang) => void;
}

export default function Navbar({ lang, onLanguageChange }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleLang = () => onLanguageChange(lang === "en" ? "ar" : "en");

  const t = (key: string) => getTranslation(lang, key);

  const navLinks = [
    { href: "/", label: t("navHome") },
    { href: "/#about", label: t("navAbout") },
    { href: "/#stages", label: t("navStages") },
    { href: "/#faq", label: t("navFAQ") },
    { href: "/#contact", label: t("navContact") },
  ];

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[70px] transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          : "bg-white/95 backdrop-blur-xl"
      } ${isDashboard ? "hidden" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg gradient-text">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
          Miss Shereen
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-text-light hover:text-primary hover:bg-primary-light transition-all duration-300 whitespace-nowrap"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-text-light hover:text-primary hover:bg-primary-light transition-all duration-300"
          >
            {t("navSignIn")}
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-semibold text-sm border-none cursor-pointer transition-all duration-300 bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)]"
          >
            {t("navCreate")}
          </Link>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white cursor-pointer text-sm font-medium transition-all duration-300 hover:border-primary hover:bg-primary-light font-inherit"
          >
            <IoLanguage className="text-base" />
            <span>{lang === "en" ? "AR" : "EN"}</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden bg-none border-none text-xl text-text cursor-pointer p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <IoClose /> : <IoMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-border shadow-lg">
          <ul className="flex flex-col p-4 gap-0.5 list-none">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-text-light hover:text-primary hover:bg-primary-light transition-all duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 pt-2 border-t border-border">
              <Link
                href="/login"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-text-light hover:text-primary hover:bg-primary-light transition-all duration-300"
              >
                {t("navSignIn")}
              </Link>
            </li>
            <li className="px-4 py-3">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] transition-all duration-300"
              >
                {t("navCreate")}
              </Link>
            </li>
            <li className="px-4 py-2">
              <button
                onClick={toggleLang}
                className="flex items-center justify-center gap-1.5 w-full px-3.5 py-2 rounded-lg border border-border bg-white cursor-pointer text-sm font-medium transition-all duration-300 hover:border-primary hover:bg-primary-light"
              >
                <IoLanguage className="text-base" />
                <span>{lang === "en" ? "AR" : "EN"}</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
