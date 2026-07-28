"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  IoSchool, IoBook, IoCheckmarkCircle, IoStar, IoTime,
  IoGrid, IoStatsChart, IoRibbon, IoCreate, IoNotifications,
  IoCalendar, IoPerson, IoLogOut,
  IoMenu, IoClose, IoWarning, IoBookOutline
} from "react-icons/io5";
import { getTranslation } from "@/lib/i18n";

const sidebarLinks = [
  { icon: IoGrid, label: "overview", active: true },
  { icon: IoBook, label: "myCourses", active: false },
  { icon: IoStatsChart, label: "progress", active: false },
  { icon: IoRibbon, label: "certificates", active: false },
  { icon: IoCreate, label: "homework", active: false },
  { icon: IoNotifications, label: "notifications", active: false },
  { icon: IoCalendar, label: "calendar", active: false },
  { icon: IoPerson, label: "profile", active: false },
];

export default function StudentDashboard() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, userRole, userStatus, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (userRole && userRole !== "student") router.push("/");
    }
  }, [user, loading, userRole, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
            <IoTime className="text-4xl text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {lang === "ar" ? "بانتظار الموافقة" : "Pending Approval"}
          </h2>
          <p className="text-text-light mb-6 leading-relaxed">
            {lang === "ar"
              ? "حسابك قيد المراجعة من الإدارة. سيتم تفعيل حسابك فور الموافقة عليه. يرجى التحقق لاحقاً."
              : "Your account is under review by the administration. It will be activated once approved. Please check back later."}
          </p>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] transition-all duration-300 cursor-pointer border-none"
          >
            <IoLogOut />
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  if (userStatus === "banned") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <IoWarning className="text-4xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-red-600">
            {lang === "ar" ? "الحساب محظور" : "Account Suspended"}
          </h2>
          <p className="text-text-light mb-6 leading-relaxed">
            {lang === "ar"
              ? "عذراً، تم حظر حسابك. يرجى التواصل مع الإدارة لمزيد من المعلومات."
              : "Sorry, your account has been suspended. Please contact the administration for more information."}
          </p>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:translate-y-[-2px] transition-all duration-300 cursor-pointer border-none"
          >
            <IoLogOut />
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  const t = (key: string) => getTranslation(lang, key);

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-[260px] bg-white border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b border-border flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base gradient-text">
            <IoSchool className="text-primary" />
            Student
          </Link>
        </div>
        <nav className="p-3 flex-1 overflow-y-auto">
          {sidebarLinks.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 mb-0.5 ${
                item.active
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-text-light hover:bg-primary-light hover:text-primary"
              }`}
            >
              <item.icon className="text-sm w-5 text-center" />
              <span>{t(item.label)}</span>
            </a>
          ))}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); logout(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-light hover:bg-red-50 hover:text-red-500 transition-all duration-300 mt-4"
          >
            <IoLogOut className="text-sm w-5 text-center" />
            <span>{t("logout")}</span>
          </a>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 p-6 md:p-8 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-xl text-text" onClick={() => setSidebarOpen(true)}>
              <IoMenu />
            </button>
            <h2 className="text-xl md:text-2xl font-bold">{t("studentDash")}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-xl bg-bg border-none flex items-center justify-center text-text-light cursor-pointer transition-all duration-300 hover:bg-primary-light hover:text-primary">
              <IoNotifications className="text-lg" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { icon: IoBook, bg: "bg-primary-light", text: "text-primary", value: "0", label: "enrolledCourses" },
            { icon: IoCheckmarkCircle, bg: "bg-[rgba(79,70,229,0.1)]", text: "text-accent", value: "0", label: "completedLess" },
            { icon: IoStar, bg: "bg-[rgba(245,158,11,0.1)]", text: "text-yellow-600", value: "0%", label: "avgScore" },
            { icon: IoTime, bg: "bg-[rgba(59,130,246,0.1)]", text: "text-blue-600", value: "0h", label: "learnTime" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-[20px] p-6 shadow-sm border border-border flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.text}`}>
                <stat.icon className="text-xl" />
              </div>
              <div>
                <strong className="text-2xl font-bold block">{stat.value}</strong>
                <span className="text-sm text-text-light">{t(stat.label)}</span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-5">{t("myCourses")}</h3>
        <div className="bg-white rounded-[20px] p-10 shadow-sm border border-border text-center mb-8">
          <IoBookOutline className="text-4xl text-text-lighter mx-auto mb-3" />
          <p className="text-text-light">
            {lang === "ar" ? "لا توجد كورسات مسجلة بعد" : "No enrolled courses yet"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
            <h4 className="text-base font-semibold mb-4">{t("weeklyProgress")}</h4>
            <div className="h-[200px] bg-bg rounded-xl flex items-center justify-center text-text-lighter text-sm">
              {lang === "ar" ? "لا توجد بيانات بعد" : "No data yet"}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
            <h4 className="text-base font-semibold mb-4">{t("upcomingAssign")}</h4>
            <p className="text-text-light text-sm">
              {lang === "ar" ? "لا توجد واجبات قادمة" : "No upcoming assignments"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
