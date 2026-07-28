"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  IoSchool, IoNotifications, IoLogOut, IoMenu,
  IoGrid, IoBarChart, IoPeople, IoShieldCheckmark, IoAnalytics,
  IoCard, IoDocumentText, IoSettings, IoPerson, IoWarning
} from "react-icons/io5";
import { FaChalkboardTeacher, FaUsers, FaUserGraduate, FaCreditCard, FaChartPie, FaBookOpen, FaCog, FaStar } from "react-icons/fa";
import { getTranslation } from "@/lib/i18n";

const sidebarLinks = [
  { icon: IoGrid, label: "overview", active: true },
  { icon: FaUsers, label: "users", active: false },
  { icon: FaChalkboardTeacher, label: "teachers", active: false },
  { icon: FaUserGraduate, label: "students", active: false },
  { icon: FaCreditCard, label: "payments", active: false },
  { icon: FaChartPie, label: "reports", active: false },
  { icon: FaBookOpen, label: "courses", active: false },
  { icon: FaCog, label: "settings", active: false },
];

const userData = [
  { name: "Miss Shereen", email: "shereen@miss-shereen.com", role: "Teacher", status: "Active", joined: "Jan 2020" },
  { name: "Mariam Ahmed", email: "mariam@email.com", role: "Student", status: "Active", joined: "Sep 2024" },
  { name: "Omar Khaled", email: "omar@email.com", role: "Student", status: "Active", joined: "Oct 2024" },
  { name: "Nour Hassan", email: "nour@email.com", role: "Parent", status: "Active", joined: "Nov 2024" },
  { name: "Dr. Ahmed R.", email: "ahmed@email.com", role: "Teacher", status: "Pending", joined: "Dec 2024" },
];

const activities = [
  { icon: FaUserGraduate, bg: "bg-primary-light", color: "text-primary", text: "New student registered" },
  { icon: FaCreditCard, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", text: "Payment received - EGP 2,500" },
  { icon: IoWarning, bg: "bg-[rgba(239,68,68,0.1)]", color: "text-red-500", text: "System alert: High traffic" },
  { icon: FaBookOpen, bg: "bg-[rgba(59,130,246,0.1)]", color: "text-blue-600", text: "New course published: Phonics" },
];

export default function AdminDashboard() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (userRole && userRole !== "admin") router.push("/");
    }
  }, [user, loading, userRole, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const t = (key: string) => getTranslation(lang, key);

  const statusClass = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Dark Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-[260px] bg-[#1F2937] text-white/80 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-white">
            <IoShieldCheckmark className="text-primary" />
            Admin
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
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="text-sm w-5 text-center" />
              <span>{t(item.label)}</span>
            </a>
          ))}
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 mt-4"
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
            <h2 className="text-xl md:text-2xl font-bold">{t("adminDash")}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-xl bg-bg border-none flex items-center justify-center text-text-light cursor-pointer transition-all duration-300 hover:bg-primary-light hover:text-primary">
              <IoNotifications className="text-lg" />
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">8</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { icon: FaUsers, bg: "bg-primary-light", color: "text-primary", value: "2,450", label: "totalUsers" },
            { icon: FaChalkboardTeacher, bg: "bg-[rgba(79,70,229,0.1)]", color: "text-accent", value: "24", label: "teachers" },
            { icon: FaUserGraduate, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", value: "2,180", label: "students" },
            { icon: FaCreditCard, bg: "bg-[rgba(59,130,246,0.1)]", color: "text-blue-600", value: "EGP 128K", label: "revenue" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-[20px] p-6 shadow-sm border border-border flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="text-xl" />
              </div>
              <div>
                <strong className="text-2xl font-bold block">{stat.value}</strong>
                <span className="text-sm text-text-light">{t(stat.label)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
            <h4 className="text-base font-semibold mb-4">{t("monthlyRevenue")}</h4>
            <div className="h-[200px] bg-bg rounded-xl flex items-end justify-center relative overflow-hidden">
              <div className="flex items-end gap-3 h-[130px] absolute bottom-8 left-6 right-6">
                {[30, 55, 70, 45, 85, 60, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-primary to-accent transition-all duration-300 hover:opacity-80" style={{ height: `${h}%`, minHeight: "20px" }} />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
            <h4 className="text-base font-semibold mb-4">{t("recentActivity")}</h4>
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
                  <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center ${a.color} text-xs flex-shrink-0`}>
                    <a.icon />
                  </div>
                  <span className="text-sm">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-5">{t("recentUsers")}</h3>
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {["name", "email", "role", "status", "joined"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider whitespace-nowrap">
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userData.map((u) => (
                <tr key={u.email} className="hover:bg-bg transition-colors">
                  <td className="px-4 py-3.5 border-b border-border font-medium">{u.name}</td>
                  <td className="px-4 py-3.5 border-b border-border text-text-light">{u.email}</td>
                  <td className="px-4 py-3.5 border-b border-border">{u.role}</td>
                  <td className="px-4 py-3.5 border-b border-border">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusClass(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 border-b border-border text-text-light">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
