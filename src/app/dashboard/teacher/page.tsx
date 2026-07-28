"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  IoSchool, IoBook, IoCheckmarkCircle, IoStar, IoTime,
  IoGrid, IoBarChart, IoRibbon, IoCreate, IoNotifications,
  IoCalendar, IoPerson, IoLogOut, IoMenu, IoPeople,
  IoChatbubbles, IoFileTray
} from "react-icons/io5";
import { FaChalkboardTeacher, FaUsers, FaFileAlt, FaChartLine, FaUserGraduate, FaBookOpen } from "react-icons/fa";
import { getTranslation } from "@/lib/i18n";

const sidebarLinks = [
  { icon: IoGrid, label: "overview", active: true },
  { icon: IoBook, label: "myCourses", active: false },
  { icon: FaUsers, label: "students", active: false },
  { icon: IoCreate, label: "assignments", active: false },
  { icon: IoBarChart, label: "analytics", active: false },
  { icon: IoChatbubbles, label: "messages", active: false },
  { icon: IoCalendar, label: "schedule", active: false },
  { icon: IoPerson, label: "profile", active: false },
];

const studentData = [
  { name: "Mariam Ahmed", course: "English Foundation", grade: "Grade 3", progress: "78%", status: "Active" },
  { name: "Omar Khaled", course: "Grammar & Writing", grade: "Prep 1", progress: "45%", status: "At Risk" },
  { name: "Laila Mostafa", course: "Conversation Skills", grade: "Sec 1", progress: "92%", status: "Active" },
  { name: "Ahmed Hassan", course: "English Foundation", grade: "Grade 3", progress: "34%", status: "New" },
  { name: "Youssef Eid", course: "Exam Prep", grade: "Sec 2", progress: "88%", status: "Active" },
];

const activities = [
  { icon: FaUsers, bg: "bg-primary-light", color: "text-primary", text: "<strong>Ahmed</strong> enrolled in Grade 3" },
  { icon: FaFileAlt, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", text: "<strong>Mariam</strong> submitted homework" },
  { icon: IoCheckmarkCircle, bg: "bg-[rgba(239,68,68,0.1)]", color: "text-red-500", text: "<strong>Omar</strong> scored 45% on quiz" },
  { icon: IoStar, bg: "bg-[rgba(59,130,246,0.1)]", color: "text-blue-600", text: "<strong>Laila</strong> completed the course!" },
];

export default function TeacherDashboard() {
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
      else if (userRole && userRole !== "teacher") router.push("/");
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

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-[260px] bg-white border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b border-border flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base gradient-text">
            <FaChalkboardTeacher className="text-primary" />
            Teacher
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
            href="/"
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
            <h2 className="text-xl md:text-2xl font-bold">{t("teacherDash")}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-xl bg-bg border-none flex items-center justify-center text-text-light cursor-pointer transition-all duration-300 hover:bg-primary-light hover:text-primary">
              <IoNotifications className="text-lg" />
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">5</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "T"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { icon: FaUsers, bg: "bg-primary-light", color: "text-primary", value: "128", label: "totalStudents" },
            { icon: IoBook, bg: "bg-[rgba(79,70,229,0.1)]", color: "text-accent", value: "8", label: "activeCourses" },
            { icon: FaFileAlt, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", value: "24", label: "pendingReview" },
            { icon: FaChartLine, bg: "bg-[rgba(59,130,246,0.1)]", color: "text-blue-600", value: "92%", label: "passRate" },
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
            <h4 className="text-base font-semibold mb-4">{t("studentPerformance")}</h4>
            <div className="h-[200px] bg-bg rounded-xl flex items-end justify-center relative overflow-hidden">
              <div className="flex items-end gap-3 h-[130px] absolute bottom-8 left-6 right-6">
                {[40, 65, 50, 80, 60, 90, 45, 70].map((h, i) => (
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
                  <span className="text-sm" dangerouslySetInnerHTML={{ __html: a.text }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-5">{t("recentStudents")}</h3>
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {["name", "course", "grade", "progress", "status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider whitespace-nowrap">
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentData.map((s) => (
                <tr key={s.name} className="hover:bg-bg transition-colors">
                  <td className="px-4 py-3.5 border-b border-border">{s.name}</td>
                  <td className="px-4 py-3.5 border-b border-border">{s.course}</td>
                  <td className="px-4 py-3.5 border-b border-border">{s.grade}</td>
                  <td className="px-4 py-3.5 border-b border-border">{s.progress}</td>
                  <td className="px-4 py-3.5 border-b border-border">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      s.status === "Active" ? "bg-green-100 text-green-800" :
                      s.status === "At Risk" ? "bg-yellow-100 text-yellow-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
