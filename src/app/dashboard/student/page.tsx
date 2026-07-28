"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  IoSchool, IoBook, IoCheckmarkCircle, IoStar, IoTime,
  IoGrid, IoStatsChart, IoRibbon, IoCreate, IoNotifications,
  IoCalendar, IoPerson, IoLogOut, IoChevronDown,
  IoMenu, IoClose
} from "react-icons/io5";
import { FaBookOpen, FaPencilAlt, FaComments, FaUserGraduate } from "react-icons/fa";
import { getTranslation } from "@/lib/i18n";

const courses = [
  { title: "English Foundation", grade: "Grade 3", icon: FaBookOpen, teacher: "Miss Shereen", lessons: 24 },
  { title: "Grammar & Writing", grade: "Prep 1", icon: FaPencilAlt, teacher: "Miss Shereen", lessons: 30 },
  { title: "Conversation Skills", grade: "Sec 1", icon: FaComments, teacher: "Miss Shereen", lessons: 20 },
];

const assignments = [
  { name: "Grammar Quiz 3", due: "Tomorrow" },
  { name: "Essay: My Summer", due: "In 3 days" },
  { name: "Reading Comprehension", due: "In 5 days" },
  { name: "Vocabulary Test", due: "Next Week" },
];

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
  const { user, loading, userRole } = useAuth();
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

  const t = (key: string) => getTranslation(lang, key);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
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
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-light hover:bg-red-50 hover:text-red-500 transition-all duration-300 mt-4"
          >
            <IoLogOut className="text-sm w-5 text-center" />
            <span>{t("logout")}</span>
          </a>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 p-6 md:p-8 min-h-screen">
        {/* Header */}
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
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">3</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { icon: IoBook, color: "green", value: "6", label: "enrolledCourses", bg: "bg-primary-light", text: "text-primary" },
            { icon: IoCheckmarkCircle, color: "purple", value: "42", label: "completedLess", bg: "bg-[rgba(79,70,229,0.1)]", text: "text-accent" },
            { icon: IoStar, color: "orange", value: "89%", label: "avgScore", bg: "bg-[rgba(245,158,11,0.1)]", text: "text-yellow-600" },
            { icon: IoTime, color: "blue", value: "28h", label: "learnTime", bg: "bg-[rgba(59,130,246,0.1)]", text: "text-blue-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-[20px] p-6 shadow-sm border border-border flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
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

        {/* My Courses */}
        <h3 className="text-lg font-semibold mb-5">{t("myCourses")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {courses.map((course) => (
            <div key={course.title} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="h-[140px] bg-gradient-to-br from-[rgba(0,191,166,0.15)] to-[rgba(79,70,229,0.1)] flex items-center justify-center text-4xl text-primary/50">
                <course.icon />
              </div>
              <div className="p-5">
                <span className="inline-block bg-primary-light text-primary-dark px-3 py-1 rounded-full text-xs font-semibold mb-2">{course.grade}</span>
                <h4 className="text-base font-semibold mb-3">{course.title}</h4>
                <div className="flex gap-4 text-sm text-text-light mb-4">
                  <span className="flex items-center gap-1.5"><FaUserGraduate className="text-primary text-xs" /> {course.teacher}</span>
                  <span className="flex items-center gap-1.5"><IoBook className="text-primary text-xs" /> {course.lessons} {t("homework")}</span>
                </div>
                <button onClick={() => alert("Demo: Continue Course")} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-semibold text-xs bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-2px] transition-all duration-300 cursor-pointer border-none">
                  {t("overview")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
            <h4 className="text-base font-semibold mb-4">{t("weeklyProgress")}</h4>
            <div className="h-[200px] bg-bg rounded-xl flex items-end justify-center relative overflow-hidden">
              <div className="flex items-end gap-3 h-[130px] absolute bottom-8 left-6 right-6">
                {[40, 65, 50, 80, 60, 90, 45].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-primary to-accent transition-all duration-300 hover:opacity-80" style={{ height: `${h}%`, minHeight: "20px" }} />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
            <h4 className="text-base font-semibold mb-4">{t("upcomingAssign")}</h4>
            <div className="space-y-0">
              {assignments.map((a) => (
                <div key={a.name} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                  <span className="text-sm">{a.name}</span>
                  <span className="text-xs text-text-lighter">{a.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
