"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n";
import { fetchActiveStudentsCount } from "@/lib/firestore-utils";
import {
  IoSchool, IoStar, IoBook, IoPerson, IoTime, IoLanguage,
  IoCall, IoMail, IoLocation, IoPaperPlane,
  IoVideocam, IoCreate, IoHelpCircle, IoDocumentText, IoRibbon,
  IoBarChart, IoPeople, IoInfinite, IoFlask,
  IoCheckmarkCircle, IoChatbubbles, IoNewspaper
} from "react-icons/io5";
import {
  FaChild, FaUserGraduate, FaSchool, FaUniversity, FaUsers,
  FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane,
  FaWhatsapp, FaBookOpen
} from "react-icons/fa";

// ========= STAGES DATA =========
const stages = [
  { name: "KG 1", icon: FaChild, age: "age4" },
  { name: "KG 2", icon: FaChild, age: "age5" },
  { name: "Grade 1", icon: FaUserGraduate, age: "age6" },
  { name: "Grade 2", icon: FaUserGraduate, age: "age7" },
  { name: "Grade 3", icon: FaUserGraduate, age: "age8" },
  { name: "Grade 4", icon: FaUserGraduate, age: "age9" },
  { name: "Grade 5", icon: FaUserGraduate, age: "age10" },
  { name: "Grade 6", icon: FaUserGraduate, age: "age11" },
  { name: "Prep 1", icon: FaSchool, age: "age12" },
  { name: "Prep 2", icon: FaSchool, age: "age13" },
  { name: "Prep 3", icon: FaSchool, age: "age14" },
  { name: "Sec 1", icon: FaUniversity, age: "age15" },
  { name: "Sec 2", icon: FaUniversity, age: "age16" },
  { name: "Sec 3", icon: FaUniversity, age: "age17" },
];

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    const html = document.documentElement;
    setLang(html.lang === "ar" ? "ar" : "en");
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.lang === "ar" ? "ar" : "en");
    });
    observer.observe(html, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchActiveStudentsCount().then(setStudentCount).catch(() => {});
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    setLang(html.lang === "ar" ? "ar" : "en");
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.lang === "ar" ? "ar" : "en");
    });
    observer.observe(html, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const t = (key: string) => getTranslation(lang, key);

  // Fade in on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("animate-fade-in");
            (entry.target as HTMLElement).style.opacity = "1";
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="min-h-screen flex items-center pt-[70px] bg-gradient-to-br from-primary-bg via-white to-[rgba(79,70,229,0.03)] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-16">
          
          {/* Hero Content */}
          <div className="fade-section" style={{ opacity: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary-dark px-4 py-2 rounded-full font-semibold text-sm mb-6">
              <FaStar className="text-xs" />
              <span>{t("heroExp")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5" dangerouslySetInnerHTML={{ __html: t("heroTitle") }} />
            <p className="text-base sm:text-lg text-text-light max-w-[540px] mb-2">{t("heroSub")}</p>
            <p className="text-sm text-text-lighter max-w-[540px] mb-8">{t("heroDesc")}</p>
            <div className="flex flex-wrap gap-4">
               <Link
                 href="#stages"
                 className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,191,166,0.4)] transition-all duration-300"
               >
                 <FaBookOpen />
                 <span>{t("exploreCourses")}</span>
               </Link>
             </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex items-center justify-center min-h-[400px] fade-section" style={{ opacity: 0 }}>
            {/* Decorative circles */}
            <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-primary to-accent opacity-[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-primary opacity-[0.08] top-[30%] right-[10%] -translate-y-1/2" />
            <div className="absolute w-[200px] h-[200px] rounded-full bg-accent opacity-[0.08] bottom-[10%] left-[10%]" />

            {/* Illustration placeholder */}
            <div className="relative z-10 w-full max-w-[450px] h-[400px] rounded-[28px] overflow-hidden border border-primary/10">
              <img src="/images/about-shereen.png" alt="Miss Shereen" className="w-full h-full object-cover" />
            </div>

            {/* Floating Cards */}
            <div className="floating-card absolute top-[8%] right-[5%] z-20 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-float border border-primary/10 pointer-events-none" style={{ animationDelay: "0s" }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm flex-shrink-0">
                <FaUsers />
              </div>
              <div>
                 <strong className="text-sm block">{studentCount > 0 ? studentCount.toLocaleString() : "—"}</strong>
                <span className="text-xs text-text-light">{t("overview")}</span>
              </div>
            </div>
            <div className="floating-card absolute top-[40%] left-[-10%] z-20 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-float border border-primary/10 pointer-events-none" style={{ animationDelay: "0.8s" }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                <FaBookOpen />
              </div>
              <div>
                <strong className="text-sm block">150+</strong>
                <span className="text-xs text-text-light">{t("lessonsLabel")}</span>
              </div>
            </div>
            <div className="floating-card absolute bottom-[20%] right-[-5%] z-20 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-float border border-primary/10 pointer-events-none" style={{ animationDelay: "1.6s" }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                <IoInfinite />
              </div>
              <div>
                <strong className="text-sm block">KG1 → G12</strong>
                <span className="text-xs text-text-light">{t("overview")}</span>
              </div>
            </div>
            <div className="floating-card absolute bottom-[5%] left-[5%] z-20 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-float border border-primary/10 pointer-events-none" style={{ animationDelay: "2.4s" }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm flex-shrink-0">
                <IoBarChart />
              </div>
              <div>
                <strong className="text-sm block">95%</strong>
                <span className="text-xs text-text-light">{t("overview")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center fade-section" style={{ opacity: 0 }}>
            <div className="relative w-full max-w-[400px] h-[400px] mx-auto rounded-[28px] bg-gradient-to-br from-[rgba(0,191,166,0.1)] to-[rgba(79,70,229,0.08)] flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <FaUserGraduate className="text-6xl text-primary/40 mx-auto mb-4" />
                <h3 className="text-lg text-text">Miss Shereen Elmairy</h3>
                <p className="text-sm text-text-light">English Language Educator</p>
              </div>
              <div className="absolute bottom-6 right-6 bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-xl text-center shadow-lg">
                <strong className="block text-xl">10+</strong>
                <span className="text-xs opacity-90">{t("yearsExp")}</span>
              </div>
            </div>

            <div>
              <p className="text-primary font-semibold text-sm mb-2">{t("aboutSub")}</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">{t("aboutTitle")}</h2>
              <p className="text-accent font-medium mb-4">{t("aboutRole")}</p>
              <p className="text-text-light leading-relaxed mb-4">{t("aboutP1")}</p>
              <p className="text-text-light leading-relaxed mb-4">{t("aboutP2")}</p>
              <p className="text-text-light leading-relaxed mb-6">{t("aboutP3")}</p>
              <div className="flex flex-wrap gap-2.5">
                {["🎓 KG to Secondary", "📚 Curriculum Expert", "🏆 95% Success Rate", "🇪🇬 Government Schools", "📖 Experimental Schools"].map((tag) => (
                  <span key={tag} className="bg-primary-light text-primary-dark px-4 py-2 rounded-full text-sm font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STAGES ============ */}
      <section id="stages" className="py-24 bg-primary-bg">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14 fade-section" style={{ opacity: 0 }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("stagesTitle")}</h2>
            <p className="text-text-light max-w-[600px] mx-auto">{t("stagesSub")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 fade-section" style={{ opacity: 0 }}>
            {stages.map((stage) => (
              <div
                key={stage.name}
                className="bg-white rounded-xl px-4 py-6 text-center shadow-sm border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(0,191,166,0.1)] to-[rgba(79,70,229,0.08)] flex items-center justify-center mx-auto mb-3 text-primary">
                  <stage.icon className="text-lg" />
                </div>
                <h4 className="text-sm font-semibold">{stage.name}</h4>
                <p className="text-xs text-text-light mt-1">{t(stage.age)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ============ CONTACT ============ */}
      <section id="contact" className="py-24 bg-primary-bg">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14 fade-section" style={{ opacity: 0 }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("contactTitle")}</h2>
            <p className="text-text-light max-w-[600px] mx-auto">{t("contactSub")}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 fade-section" style={{ opacity: 0 }}>
            <div>
              <h3 className="text-xl font-bold mb-2">{t("contactInfo")}</h3>
              <p className="text-text-light mb-8">{t("contactInfoP")}</p>
              <div className="flex flex-col gap-5">
                {[
                  { icon: FaPhone, label: "phone", value: "+20 10 94589403" },
                  { icon: FaWhatsapp, label: "WhatsApp", value: "+20 10 94589403" },
                  { icon: FaEnvelope, label: "email", value: "info@miss-shereen.com" },
                  { icon: FaMapMarkerAlt, label: "address", value: "123 Education Street, Cairo, Egypt" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(0,191,166,0.1)] to-[rgba(79,70,229,0.08)] flex items-center justify-center text-primary flex-shrink-0">
                      <item.icon className="text-lg" />
                    </div>
                    <div>
                      <strong className="text-sm block">{t(item.label)}</strong>
                      <span className="text-sm text-text-light">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="bg-white rounded-[28px] p-9 shadow-sm border border-border"
            >
              <h4 className="text-lg font-semibold mb-5">{t("sendMsg")}</h4>
              <div className="space-y-4">
                <input type="text" placeholder={t("overview")} disabled className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg transition-all duration-300 disabled:opacity-60" />
                <input type="email" placeholder={t("email")} disabled className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg transition-all duration-300 disabled:opacity-60" />
                <input type="text" placeholder="Subject" disabled className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg transition-all duration-300 disabled:opacity-60" />
                <textarea placeholder="Your Message" disabled rows={4} className="w-full px-4 py-3.5 border border-border rounded-xl text-sm bg-bg transition-all duration-300 disabled:opacity-60 resize-none" />
                <button
                  type="submit"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] opacity-60 cursor-not-allowed"
                >
                  <FaPaperPlane className="text-xs" />
                  <span>{t("send")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
