"use client";

import { useState, useEffect, FormEvent, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getTranslation } from "@/lib/i18n";
import { getYouTubeEmbedUrl } from "@/lib/types";
import {
  fetchStudents, fetchPendingStudents, updateUserStatus, deleteUser,
  fetchCourses, saveCourse, deleteCourse,
  fetchLessons, saveLesson, deleteLesson,
  fetchExams, saveExam, deleteExam, fetchExamResults, submitExamResult,
  fetchHomework, saveHomework, deleteHomework, fetchSubmissions, gradeSubmission,
  fetchFiles, saveFile, deleteFile, uploadFile,
  fetchTransactions, addTransaction, deleteTransaction,
  fetchReports, saveReport, deleteReport,
  fetchNotifications, sendNotification, deleteNotification,
  updateUserProfile,
  fetchWalletPromos, createWalletPromo, validateWalletPromo,
  deleteWalletPromo
} from "@/lib/firestore-utils";
import type { AppUser, Course, Lesson, Exam, ExamResult, Homework, HomeworkSubmission, AppFile, WalletTransaction, Report, Notification, WalletPromo } from "@/lib/types";
import {
  IoSchool, IoNotifications, IoLogOut, IoMenu, IoGrid,
  IoPeople, IoBook, IoCreate, IoDocumentText, IoTrash,
  IoCheckmarkCircle, IoCloseCircle, IoBan, IoAdd, IoClose,
  IoArrowBack, IoSearch, IoFilter, IoReload, IoWallet,
  IoStatsChart, IoRibbon, IoSettings, IoPaperPlane,
  IoEye, IoEyeOff, IoCloudUpload, IoLink, IoCopy, IoCash
} from "react-icons/io5";
import { FaUserGraduate, FaUsers, FaBookOpen, FaPencilAlt, FaChalkboardTeacher, FaCreditCard, FaFileAlt, FaRobot, FaGamepad, FaChartBar, FaWhatsapp } from "react-icons/fa";

type ATab = "overview" | "students" | "requests" | "courses" | "lessons" | "files" | "wallet" | "wallet-promos" | "exams" | "homework" | "reports" | "notifications" | "settings";

type ModalType = "course" | "lesson" | "exam" | "homework" | "wallet" | "promo" | "report" | "notif";

interface AdminTabProps {
  lang: "en" | "ar";
  user: any;
  students: AppUser[];
  pendingStudents: AppUser[];
  courses: Course[];
  lessons: Lesson[];
  exams: Exam[];
  examResults: ExamResult[];
  homework: Homework[];
  files: AppFile[];
  transactions: WalletTransaction[];
  walletPromos: WalletPromo[];
  reports: Report[];
  notifications: Notification[];
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  modalType: ModalType;
  form: any;
  setForm: (f: any) => void;
  editId: string | null;
  selectedFile: File | null;
  setSelectedFile: (f: File | null) => void;
  walletForm: any;
  setWalletForm: (f: any) => void;
  showWalletModal: boolean;
  setShowWalletModal: (v: boolean) => void;
  promoForm: any;
  setPromoForm: (f: any) => void;
  showPromoModal: boolean;
  setShowPromoModal: (v: boolean) => void;
  loadAll: () => Promise<void>;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleDelete: (type: "course" | "lesson" | "exam" | "homework" | "report", id: string) => Promise<void>;
  handleGrade: (subId: string, grade: number, annotation: string, reward: number) => Promise<void>;
  handleFileUpload: () => Promise<void>;
  openAdd: (type: ModalType) => void;
  openEdit: (type: ModalType, item: any) => void;
}

// ====== OVERVIEW ======
const OverviewTab = memo(function OverviewTab(p: AdminTabProps) {
  const { lang, students, lessons, pendingStudents, transactions } = p;
  const activeStudents = students.filter(s => s.status === "active").length;
  const pendingCount = pendingStudents.length;
  const [revenue, setRevenue] = useState(transactions.reduce((a, t) => t.type === "credit" ? a + t.amount : a, 0));
  const [debits, setDebits] = useState(transactions.reduce((a, t) => t.type === "debit" ? a + t.amount : a, 0));
  const [editingFinance, setEditingFinance] = useState<string | null>(null);
  useEffect(() => {
    setRevenue(transactions.reduce((a, t) => t.type === "credit" ? a + t.amount : a, 0));
    setDebits(transactions.reduce((a, t) => t.type === "debit" ? a + t.amount : a, 0));
  }, [transactions]);
  const netProfit = revenue - debits;
  const financeCards = [
    { key: "revenue", icon: IoWallet, bg: "bg-[rgba(59,130,246,0.1)]", color: "text-blue-600", value: revenue, label: lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue" },
    { key: "profit", icon: IoStatsChart, bg: "bg-[rgba(16,185,129,0.1)]", color: "text-green-600", value: netProfit, label: lang === "ar" ? "صافي الربح" : "Net Profit" },
    { key: "debits", icon: IoCash, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", value: debits, label: lang === "ar" ? "المصروفات" : "Debits" },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { icon: FaUserGraduate, bg: "bg-primary-light", color: "text-primary", value: activeStudents.toString(), label: lang === "ar" ? "طلاب معتمدين" : "Active Students", key: "" },
          { icon: IoPeople, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", value: pendingCount.toString(), label: lang === "ar" ? "معلقين" : "Pending", key: "" },
          { icon: IoBook, bg: "bg-[rgba(79,70,229,0.1)]", color: "text-accent", value: lessons.length.toString(), label: lang === "ar" ? "دروس" : "Lessons", key: "" },
          ...financeCards.map(c => ({
            icon: c.icon, bg: c.bg, color: c.color, value: c.value.toString(), label: c.label, key: c.key
          })),
        ].map(s => (
          <div key={s.label} className="bg-white rounded-[20px] p-6 shadow-sm border border-border flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}><s.icon className="text-xl" /></div>
            <div className="flex-1">
              {s.key && editingFinance === s.key ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={s.key === "revenue" ? revenue : s.key === "profit" ? netProfit : debits} onChange={e => {
                    const v = Number(e.target.value);
                    if (s.key === "revenue") setRevenue(v);
                    else if (s.key === "debits") setDebits(v);
                  }} className="w-24 px-2 py-1 border border-border rounded-lg text-sm" autoFocus />
                  <button onClick={() => setEditingFinance(null)} className="text-xs text-primary cursor-pointer bg-transparent border-none">{lang === "ar" ? "حفظ" : "Save"}</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <strong className="text-2xl font-bold block">{s.value}</strong>
                  {s.key && <button onClick={() => setEditingFinance(s.key)} className="text-xs text-text-light cursor-pointer bg-transparent border-none hover:text-primary"><IoCreate /></button>}
                </div>
              )}
              <span className="text-sm text-text-light">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
          <h4 className="text-base font-semibold mb-4">{lang === "ar" ? "آخر الطلاب" : "Recent Students"}</h4>
          {students.slice(0, 5).map(s => (
            <div key={s.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-sm font-medium">{s.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-green-100 text-green-700" : s.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{s.status}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
          <h4 className="text-base font-semibold mb-4">{lang === "ar" ? "آخر الدروس" : "Recent Lessons"}</h4>
          {lessons.slice(0, 5).map(l => (
            <div key={l.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-sm">{l.title}</span>
              <span className="text-xs text-text-light">{l.viewers ? Object.keys(l.viewers).length : 0} {lang === "ar" ? "مشاهدة" : "views"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ====== STUDENTS ======
const StudentsTab = memo(function StudentsTab(p: AdminTabProps) {
  const { lang, students, loadAll, setWalletForm, setShowWalletModal } = p;
  const [editingStudent, setEditingStudent] = useState<AppUser | null>(null);
  const [editStudentForm, setEditStudentForm] = useState<any>({});
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", password: "", parentName: "", parentPhone: "" });
  const [createMsg, setCreateMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateMsg(lang === "ar" ? "الاسم والبريد وكلمة المرور مطلوبة" : "Name, email, and password required");
      return;
    }
    setCreating(true);
    setCreateMsg("");
    try {
      const res = await fetch("/api/create-student", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: createForm.email, password: createForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      await setDoc(doc(db, "users", data.uid), {
        name: createForm.name, email: createForm.email,
        phone: createForm.phone || "", role: "student", status: "active",
        photoURL: "", school: "", department: "", governorate: "",
        parentName: createForm.parentName || "", parentPhone: createForm.parentPhone || "",
        wallet: 0, streak: 0, badges: [], points: 0, activatedLessons: [],
        createdAt: serverTimestamp(),
      });
      setCreateMsg(lang === "ar" ? "تم إنشاء الطالب بنجاح!" : "Student created successfully!");
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", phone: "", password: "", parentName: "", parentPhone: "" });
      loadAll();
    } catch (e: any) { setCreateMsg(e.message); }
    setCreating(false);
  };
  return (
    <div>
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowCreateModal(false); setCreateMsg(""); }}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{lang === "ar" ? "إضافة طالب جديد" : "Add New Student"}</h3><button onClick={() => { setShowCreateModal(false); setCreateMsg(""); }} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
            <div className="space-y-4">
              {["name", "email", "phone", "password", "parentName", "parentPhone"].map(key => (
                <input key={key} type={key === "password" ? "password" : "text"} placeholder={key} value={(createForm as any)[key] || ""} onChange={e => setCreateForm({ ...createForm, [key]: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
              ))}
              <button onClick={handleCreate} disabled={creating} className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none disabled:opacity-50">{creating ? (lang === "ar" ? "جارٍ الإنشاء..." : "Creating...") : (lang === "ar" ? "إنشاء الطالب" : "Create Student")}</button>
              {createMsg && <p className={`text-sm text-center ${createMsg.includes("success") || createMsg.includes("بن") ? "text-green-600" : "text-red-500"}`}>{createMsg}</p>}
            </div>
          </div>
        </div>
      )}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingStudent(null)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{lang === "ar" ? "تعديل بيانات الطالب" : "Edit Student"}</h3><button onClick={() => setEditingStudent(null)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
            <div className="space-y-4">
              {["name", "phone", "school", "department", "governorate", "parentName", "parentPhone"].map(key => (
                <input key={key} placeholder={key} value={editStudentForm[key] || ""} onChange={e => setEditStudentForm({ ...editStudentForm, [key]: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
              ))}
              <input type="number" placeholder={lang === "ar" ? "المحفظة" : "Wallet"} value={editStudentForm.wallet || 0} onChange={e => setEditStudentForm({ ...editStudentForm, wallet: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
              <button type="button" onClick={async () => { await updateUserProfile(editingStudent.id, editStudentForm); setEditingStudent(null); loadAll(); }} className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "حفظ التغييرات" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "ar" ? "بحث..." : "Search..."} className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm" />
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium cursor-pointer border-none flex items-center gap-2"><IoAdd /> {lang === "ar" ? "إضافة طالب" : "Add Student"}</button>
        </div>
        <span className="text-sm text-text-light">{students.length} {lang === "ar" ? "طالب" : "students"}</span>
      </div>
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr>{[lang === "ar" ? "الاسم" : "name", lang === "ar" ? "البريد" : "email", lang === "ar" ? "الحالة" : "status", lang === "ar" ? "المحفظة" : "wallet", lang === "ar" ? "إجراءات" : "actions"].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-bg transition-colors">
                <td className="px-4 py-3.5 border-b border-border font-medium">{s.name}</td>
                <td className="px-4 py-3.5 border-b border-border text-text-light">{s.email}</td>
                <td className="px-4 py-3.5 border-b border-border">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s.status === "active" ? "bg-green-100 text-green-800" : s.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3.5 border-b border-border">{s.wallet || 0} {lang === "ar" ? "ج.م" : "EGP"}</td>
                <td className="px-4 py-3.5 border-b border-border">
                  <div className="flex gap-2">
                    {s.status === "pending" && <button onClick={() => { updateUserStatus(s.id, "active"); loadAll(); }} className="px-2 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs cursor-pointer border-none" title="Approve"><IoCheckmarkCircle /></button>}
                    {s.status === "active" && <button onClick={() => { updateUserStatus(s.id, "banned"); loadAll(); }} className="px-2 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs cursor-pointer border-none" title="Ban"><IoBan /></button>}
                    {s.status === "banned" && <button onClick={() => { updateUserStatus(s.id, "active"); loadAll(); }} className="px-2 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs cursor-pointer border-none" title="Unban"><IoCheckmarkCircle /></button>}
                    <button onClick={() => { setEditingStudent(s); setEditStudentForm({ name: s.name, phone: s.phone, school: s.school, department: s.department, governorate: s.governorate, parentName: s.parentName, parentPhone: s.parentPhone, wallet: s.wallet }); }} className="px-2 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs cursor-pointer border-none" title="Edit"><FaPencilAlt /></button>
                    <button onClick={() => { deleteUser(s.id); loadAll(); }} className="px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs cursor-pointer border-none" title="Delete"><IoTrash /></button>
                    <button onClick={() => { setWalletForm({ studentId: s.id, txType: "credit", amount: 0, description: "" }); setShowWalletModal(true); }} className="px-2 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs cursor-pointer border-none" title="Add Wallet"><IoWallet /></button>
                    {s.phone && <a href={`https://wa.me/${s.phone.replace(/^0/, "2")}`} target="_blank" className="px-2 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs inline-flex items-center cursor-pointer"><FaWhatsapp /></a>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// ====== REQUESTS ======
const RequestsTab = memo(function RequestsTab(p: AdminTabProps) {
  const { lang, pendingStudents, loadAll } = p;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "طلبات التسجيل" : "Registration Requests"} ({pendingStudents.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pendingStudents.map(s => (
          <div key={s.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xl mx-auto mb-3">{s.name?.charAt(0)}</div>
            <h4 className="font-semibold text-center">{s.name}</h4>
            <p className="text-xs text-text-light text-center">{s.email}</p>
            <p className="text-xs text-text-light text-center">{s.phone}</p>
            {s.school && <p className="text-xs text-text-light text-center mt-1">{s.school}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => { updateUserStatus(s.id, "active"); loadAll(); }} className="flex-1 px-3 py-2 rounded-xl bg-green-100 text-green-700 text-xs font-medium cursor-pointer border-none flex items-center justify-center gap-1"><IoCheckmarkCircle /> {lang === "ar" ? "قبول" : "Approve"}</button>
              <button onClick={() => { updateUserStatus(s.id, "banned"); loadAll(); }} className="flex-1 px-3 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-medium cursor-pointer border-none flex items-center justify-center gap-1"><IoCloseCircle /> {lang === "ar" ? "رفض" : "Reject"}</button>
              {s.phone && <a href={`https://wa.me/${s.phone.replace(/^0/, "2")}`} target="_blank" className="px-3 py-2 rounded-xl bg-green-100 text-green-700 text-xs font-medium inline-flex items-center cursor-pointer"><FaWhatsapp /></a>}
            </div>
          </div>
        ))}
        {pendingStudents.length === 0 && <div className="col-span-full text-center py-12 text-text-light">{lang === "ar" ? "لا توجد طلبات معلقة" : "No pending requests"}</div>}
      </div>
    </div>
  );
});

// ====== COURSES ======
const CoursesTab = memo(function CoursesTab(p: AdminTabProps) {
  const { lang, courses, openAdd, openEdit, handleDelete } = p;
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "الكورسات" : "Courses"} ({courses.length})</h3>
        <button onClick={() => openAdd("course")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إضافة كورس" : "Add Course"}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(c => (
          <div key={c.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
            <h4 className="font-semibold">{c.name}</h4>
            <p className="text-xs text-text-light mt-1">{c.grade} — {c.description?.slice(0, 60)}</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{c.courseType === "video" ? (lang === "ar" ? "فيديو" : "Video") : (lang === "ar" ? "دروس نصية" : "Text Lessons")}</span>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit("course", c)} className="px-3 py-1.5 rounded-lg bg-bg text-sm cursor-pointer border-none"><FaPencilAlt /></button>
              <button onClick={() => handleDelete("course", c.id)} className="px-3 py-1.5 rounded-lg bg-bg text-red-500 text-sm cursor-pointer border-none"><IoTrash /></button>
            </div>
          </div>
        ))}
        {courses.length === 0 && <div className="col-span-full text-center py-12 text-text-light">{lang === "ar" ? "لا توجد كورسات" : "No courses"}</div>}
      </div>
    </div>
  );
});

// ====== LESSONS ======
const LessonsTab = memo(function LessonsTab(p: AdminTabProps) {
  const { lang, lessons, openAdd, openEdit, handleDelete } = p;
  const [playing, setPlaying] = useState<Lesson | null>(null);
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "الدروس" : "Lessons"} ({lessons.length})</h3>
        <button onClick={() => openAdd("lesson")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إضافة درس" : "Add Lesson"}</button>
      </div>
      {playing ? (
        <div>
          <button onClick={() => setPlaying(null)} className="flex items-center gap-2 text-sm text-primary mb-4 cursor-pointer bg-transparent border-none"><IoArrowBack /> {lang === "ar" ? "عودة" : "Back"}</button>
          <h4 className="text-xl font-bold mb-3">{playing.title}</h4>
          {playing.thumbnail && <img src={playing.thumbnail} className="w-full h-48 object-cover rounded-xl mb-4" alt={playing.title} />}
          {playing.videoUrl && <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4"><iframe src={getYouTubeEmbedUrl(playing.videoUrl)} className="w-full h-full" allowFullScreen /></div>}
          {playing.embedCode && <div className="mb-4" dangerouslySetInnerHTML={{ __html: playing.embedCode }} />}
          {playing.price > 0 && <div className="text-sm mb-1">{lang === "ar" ? "السعر:" : "Price:"} {playing.price} {lang === "ar" ? "ج.م" : "EGP"}</div>}
          <div className="text-sm mb-1">{lang === "ar" ? "حد المشاهدات:" : "View limit:"} {playing.viewLimit || 0}</div>
          <div className="text-sm mb-2">{lang === "ar" ? "الأكواد:" : "Codes:"} {playing.codes?.join(", ") || "—"}</div>
          <div className="text-sm">{lang === "ar" ? "المشاهدون:" : "Viewers:"} {playing.viewers ? Object.keys(playing.viewers).length : 0}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map(l => (
            <div key={l.id} className="bg-white rounded-[20px] p-4 shadow-sm border border-border">
              {l.thumbnail && <img src={l.thumbnail} className="w-full h-32 object-cover rounded-xl mb-3" alt={l.title} />}
              <h4 className="font-semibold">{l.title}</h4>
              <p className="text-xs text-text-light mt-1">{l.courseName} • {l.viewers ? Object.keys(l.viewers).length : 0} views</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{l.lessonType === "video" ? (lang === "ar" ? "فيديو" : "Video") : (lang === "ar" ? "نصي" : "Text")}</span>
                {l.price > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{l.price} {lang === "ar" ? "ج.م" : "EGP"}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPlaying(l)} className="px-3 py-1.5 rounded-lg bg-bg text-sm cursor-pointer border-none"><IoEye /></button>
                <button onClick={() => openEdit("lesson", { ...l, codes: l.codes?.join("\n") || "" })} className="px-3 py-1.5 rounded-lg bg-bg text-sm cursor-pointer border-none"><FaPencilAlt /></button>
                <button onClick={() => handleDelete("lesson", l.id)} className="px-3 py-1.5 rounded-lg bg-bg text-red-500 text-sm cursor-pointer border-none"><IoTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ====== FILES ======
const FilesTab = memo(function FilesTab(p: AdminTabProps) {
  const { lang, files, lessons, selectedFile, setSelectedFile, form, setForm, handleFileUpload, loadAll } = p;
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "الملفات" : "Files"} ({files.length})</h3>
        <div className="flex gap-2">
          <label className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer">
            {selectedFile ? selectedFile.name : (lang === "ar" ? "رفع ملف" : "UPLOAD")}
            <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <select value={form.lessonId || ""} onChange={e => setForm({ ...form, lessonId: e.target.value })} className="px-3 py-2 border border-border rounded-xl text-sm">
            <option value="">{lang === "ar" ? "عام" : "Public"}</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
          <button onClick={handleFileUpload} disabled={!selectedFile} className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none disabled:opacity-50"><IoCloudUpload /> {lang === "ar" ? "رفع" : "Upload"}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.map(f => {
          const lesson = lessons.find(l => l.id === f.lessonId);
          return (
            <div key={f.id} className="bg-white rounded-[20px] p-4 shadow-sm border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaFileAlt className="text-primary text-xl" />
                <div>
                  <span className="text-sm font-medium block">{f.name}</span>
                  <span className="text-xs text-text-light">{f.isPublic ? (lang === "ar" ? "عام" : "Public") : lesson?.title || (lang === "ar" ? "محجوب" : "Locked")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={f.url} target="_blank" className="px-2 py-1.5 rounded-lg bg-bg text-sm cursor-pointer"><IoEye /></a>
                <button onClick={() => { deleteFile(f.id, f.publicId); loadAll(); }} className="px-2 py-1.5 rounded-lg bg-bg text-red-500 text-sm cursor-pointer border-none"><IoTrash /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ====== WALLET ======
const WalletTab = memo(function WalletTab(p: AdminTabProps) {
  const { lang, students, transactions, walletForm, setWalletForm, showWalletModal, setShowWalletModal, loadAll } = p;
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "المحفظة" : "Wallet"}</h3>
        <button onClick={() => { setWalletForm({ studentId: students[0]?.id || "", txType: "credit", amount: 0, description: "" }); setShowWalletModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إضافة معاملة" : "Add Transaction"}</button>
      </div>
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowWalletModal(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{lang === "ar" ? "إضافة معاملة مالية" : "Add Transaction"}</h3><button onClick={() => setShowWalletModal(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
            <div className="space-y-4">
              <select value={walletForm.studentId} onChange={e => setWalletForm({ ...walletForm, studentId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required>
                <option value="">{lang === "ar" ? "اختر الطالب" : "Select Student"}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={walletForm.txType} onChange={e => setWalletForm({ ...walletForm, txType: e.target.value as any })} className="w-full px-4 py-3 border border-border rounded-xl text-sm">
                <option value="credit">{lang === "ar" ? "إيداع" : "Credit"}</option>
                <option value="debit">{lang === "ar" ? "خصم" : "Debit"}</option>
              </select>
              <input type="number" placeholder={lang === "ar" ? "المبلغ" : "Amount"} value={walletForm.amount || ""} onChange={e => setWalletForm({ ...walletForm, amount: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" min={1} required />
              <textarea placeholder={lang === "ar" ? "الوصف" : "Description"} value={walletForm.description} onChange={e => setWalletForm({ ...walletForm, description: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={2} required />
              <button type="button" onClick={async () => { await addTransaction(walletForm.studentId, walletForm.txType, walletForm.amount, walletForm.description); setShowWalletModal(false); loadAll(); }} className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "إضافة" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
              <thead><tr>{[lang === "ar" ? "الطالب" : "student", lang === "ar" ? "النوع" : "type", lang === "ar" ? "المبلغ" : "amount", lang === "ar" ? "الوصف" : "description", lang === "ar" ? "التاريخ" : "date", ""].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {transactions.map(tx => {
              const student = students.find(s => s.id === tx.studentId);
              return (
                <tr key={tx.id} className="hover:bg-bg">
                  <td className="px-4 py-3.5 border-b border-border">{student?.name || tx.studentId}</td>
                  <td className="px-4 py-3.5 border-b border-border"><span className={`text-xs font-semibold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>{tx.type === "credit" ? (lang === "ar" ? "إيداع" : "Credit") : (lang === "ar" ? "خصم" : "Debit")}</span></td>
                  <td className="px-4 py-3.5 border-b border-border font-bold">{tx.type === "credit" ? "+" : "-"}{tx.amount}</td>
                  <td className="px-4 py-3.5 border-b border-border text-text-light">{tx.description}</td>
                  <td className="px-4 py-3.5 border-b border-border text-text-light">{tx.createdAt?.toDate?.().toLocaleDateString() || ""}</td>
                  <td className="px-4 py-3.5 border-b border-border"><button onClick={() => { if (confirm(lang === "ar" ? "حذف المعاملة؟" : "Delete transaction?")) { deleteTransaction(tx.id, tx.studentId, tx.type, tx.amount); loadAll(); } }} className="text-red-500 cursor-pointer bg-transparent border-none"><IoTrash /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// ====== WALLET PROMOS ======
const WalletPromosTab = memo(function WalletPromosTab(p: AdminTabProps) {
  const { lang, walletPromos, loadAll } = p;
  const [generating, setGenerating] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };
  const handleGenerate = async () => {
    setGenerating(true);
    setPromoMsg("");
    const code = generateCode();
    try {
      await createWalletPromo(code, p.form.promoAmount || 0, p.form.promoMaxUses || 1, p.form.promoExpires || null);
      setPromoMsg(`${lang === "ar" ? "تم إنشاء الكود" : "Code created"}: ${code}`);
      loadAll();
    } catch (e: any) { setPromoMsg(e.message); }
    setGenerating(false);
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "قسائم المحفظة" : "Wallet Promos"}</h3>
        <button onClick={() => p.openAdd("promo")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إنشاء كود" : "Create Code"}</button>
      </div>
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr>{[lang === "ar" ? "الكود" : "Code", lang === "ar" ? "المبلغ" : "Amount", lang === "ar" ? "الاستخدامات" : "Uses", lang === "ar" ? "انتهاء" : "Expires", lang === "ar" ? "الحالة" : "Status", lang === "ar" ? "إجراءات" : "Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {walletPromos.map(promo => {
              const used = (promo.usedBy || []).length;
              const expired = promo.expiresAt && new Date(promo.expiresAt.toDate()) < new Date();
              const exhausted = used >= promo.maxUses;
              return (
                <tr key={promo.id} className="hover:bg-bg">
                  <td className="px-4 py-3.5 border-b border-border font-mono text-sm">{promo.code}</td>
                  <td className="px-4 py-3.5 border-b border-border font-bold">{promo.amount} EGP</td>
                  <td className="px-4 py-3.5 border-b border-border">{used}/{promo.maxUses}</td>
                  <td className="px-4 py-3.5 border-b border-border text-text-light">{promo.expiresAt ? promo.expiresAt.toDate?.().toLocaleDateString() : lang === "ar" ? "لا يوجد" : "None"}</td>
                  <td className="px-4 py-3.5 border-b border-border">
                    {expired ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{lang === "ar" ? "منتهي" : "Expired"}</span> :
                      exhausted ? <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{lang === "ar" ? "مكتمل" : "Exhausted"}</span> :
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{lang === "ar" ? "نشط" : "Active"}</span>}
                  </td>
                  <td className="px-4 py-3.5 border-b border-border">
                    <button onClick={async () => { await deleteWalletPromo(promo.id); loadAll(); }} className="px-2 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs cursor-pointer border-none" title="Delete"><IoTrash /></button>
                  </td>
                </tr>
              );
            })}
            {walletPromos.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-text-light">{lang === "ar" ? "لا توجد قسائم" : "No promos yet"}</td></tr>}
          </tbody>
        </table>
      </div>
      {p.showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => p.setShowPromoModal(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{lang === "ar" ? "إنشاء كود قسيمة" : "Create Promo Code"}</h3><button onClick={() => p.setShowPromoModal(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
            <div className="space-y-4">
              <input type="number" placeholder={lang === "ar" ? "المبلغ (ج.م)" : "Amount (EGP)"} value={p.form.promoAmount || ""} onChange={e => p.setForm({ ...p.form, promoAmount: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" min={1} required />
              <input type="number" placeholder={lang === "ar" ? "الحد الأقصى للاستخدامات" : "Max Uses"} value={p.form.promoMaxUses || ""} onChange={e => p.setForm({ ...p.form, promoMaxUses: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" min={1} required />
              <input type="date" placeholder={lang === "ar" ? "تاريخ الانتهاء" : "Expiry Date"} value={p.form.promoExpires || ""} onChange={e => p.setForm({ ...p.form, promoExpires: e.target.value || null })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
              <button type="button" onClick={handleGenerate} disabled={generating} className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none disabled:opacity-50">{generating ? "..." : (lang === "ar" ? "إنشاء الكود" : "Generate Code")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
const ExamsTab = memo(function ExamsTab(p: AdminTabProps) {
  const { lang, exams, courses, showModal, setShowModal, modalType, form, setForm, editId, loadAll, openAdd, openEdit, handleDelete } = p;
  const [examQuestions, setExamQuestions] = useState<{ id: string; type: string; question: string; options: string[]; correctAnswer: string; points: number }[]>([]);
  const [qForm, setQForm] = useState({ type: "mcq", question: "", options: "", correctAnswer: "", points: 1 });
  const addQ = () => {
    setExamQuestions([...examQuestions, { ...qForm, id: Date.now().toString(), options: qForm.options.split("\n").filter(Boolean) }]);
    setQForm({ type: "mcq", question: "", options: "", correctAnswer: "", points: 1 });
  };
  const startExamCreate = () => { setExamQuestions([]); setForm({}); openAdd("exam"); };
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "الامتحانات" : "Exams"} ({exams.length})</h3>
        <button onClick={startExamCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إضافة امتحان" : "Add Exam"}</button>
      </div>
      {showModal && modalType === "exam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{lang === "ar" ? "إضافة/تعديل امتحان" : "Add/Edit Exam"}</h3><button onClick={() => setShowModal(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
            <div className="space-y-4">
              <input placeholder={lang === "ar" ? "عنوان الامتحان" : "Title"} value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
              <select value={form.courseId || ""} onChange={e => setForm({ ...form, courseId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm">
                <option value="">{lang === "ar" ? "اختر الكورس (اختياري)" : "Select Course (optional)"}</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-4">
                <input type="number" placeholder={lang === "ar" ? "المدة (دقائق)" : "Duration (min)"} value={form.duration || 10} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} className="flex-1 px-4 py-3 border border-border rounded-xl text-sm" />
                <input type="number" placeholder={lang === "ar" ? "درجة النجاح %" : "Pass Score %"} value={form.passScore || 50} onChange={e => setForm({ ...form, passScore: Number(e.target.value) })} className="flex-1 px-4 py-3 border border-border rounded-xl text-sm" />
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold mb-3">{lang === "ar" ? "الأسئلة" : "Questions"} ({examQuestions.length})</h4>
                {examQuestions.map((q, i) => (
                  <div key={q.id} className="bg-bg p-3 rounded-xl mb-2 text-sm">
                    <span className="font-medium">{i + 1}. {q.question}</span> <span className="text-xs text-text-light">({q.type})</span>
                    <button type="button" onClick={() => setExamQuestions(examQuestions.filter(x => x.id !== q.id))} className="float-right text-red-500 cursor-pointer bg-transparent border-none"><IoTrash /></button>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <select value={qForm.type} onChange={e => setQForm({ ...qForm, type: e.target.value })} className="px-3 py-2 border border-border rounded-xl text-sm">
                    <option value="mcq">MCQ</option><option value="tf">{lang === "ar" ? "صواب/خطأ" : "True/False"}</option><option value="short">{lang === "ar" ? "إجابة قصيرة" : "Short Answer"}</option>
                  </select>
                  <input type="number" placeholder={lang === "ar" ? "النقاط" : "Points"} value={qForm.points} onChange={e => setQForm({ ...qForm, points: Number(e.target.value) })} className="px-3 py-2 border border-border rounded-xl text-sm" />
                </div>
                <textarea placeholder={lang === "ar" ? "السؤال" : "Question"} value={qForm.question} onChange={e => setQForm({ ...qForm, question: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm mt-2" />
                {qForm.type === "mcq" && <textarea placeholder={lang === "ar" ? "الخيارات (سطر لكل خيار)" : "Options (one per line)"} value={qForm.options} onChange={e => setQForm({ ...qForm, options: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm mt-2" />}
                <input placeholder={lang === "ar" ? "الإجابة الصحيحة" : "Correct Answer"} value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm mt-2" />
                <button type="button" onClick={addQ} className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-sm cursor-pointer border-none">{lang === "ar" ? "إضافة سؤال" : "Add Question"}</button>
              </div>
              <button type="button" onClick={async () => { const data = { ...form, questions: examQuestions }; if (editId) { await saveExam(editId, data); } else { await saveExam(null, data); } setShowModal(false); loadAll(); }} className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{editId ? (lang === "ar" ? "تحديث" : "Update") : (lang === "ar" ? "إنشاء الامتحان" : "Create Exam")}</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map(e => (
          <div key={e.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
            <h4 className="font-semibold">{e.title}</h4>
            <p className="text-xs text-text-light">{e.courseName} • {e.questions?.length || 0} Q • {e.duration || 0}min</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit("exam", e)} className="px-3 py-1.5 rounded-lg bg-bg text-sm cursor-pointer border-none"><FaPencilAlt /></button>
              <button onClick={() => handleDelete("exam", e.id)} className="px-3 py-1.5 rounded-lg bg-bg text-red-500 text-sm cursor-pointer border-none"><IoTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ====== HOMEWORK ======
const HomeworkTab = memo(function HomeworkTab(p: AdminTabProps) {
  const { lang, homework, students, openAdd, openEdit, handleDelete, handleGrade, loadAll } = p;
  const [selectedHW, setSelectedHW] = useState<string | null>(null);
  const [hwSubs, setHwSubs] = useState<HomeworkSubmission[]>([]);
  const loadSubs = async (hwId: string) => {
    setSelectedHW(hwId);
    setHwSubs(await fetchSubmissions(hwId));
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "الواجبات" : "Homework"} ({homework.length})</h3>
        <button onClick={() => openAdd("homework")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إضافة واجب" : "Add Homework"}</button>
      </div>
      {selectedHW ? (
        <div>
          <button onClick={() => setSelectedHW(null)} className="flex items-center gap-2 text-sm text-primary mb-4 cursor-pointer bg-transparent border-none"><IoArrowBack /> {lang === "ar" ? "عودة" : "Back"}</button>
          <div className="space-y-4">
            {hwSubs.map(sub => {
              const student = students.find(s => s.id === sub.studentId);
              return (
                <div key={sub.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{student?.name || sub.studentId}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sub.files?.map((url, i) => (
                          <a key={i} href={url} target="_blank" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg text-xs text-primary cursor-pointer"><IoEye /> {lang === "ar" ? "ملف" : "File"} {i + 1}</a>
                        ))}
                      </div>
                    </div>
                    {sub.grade !== undefined ? (
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">{sub.grade}</span>
                        {sub.reward ? <p className="text-xs text-green-600">+{sub.reward} {lang === "ar" ? "ج.م" : "EGP"}</p> : null}
                        <p className="text-xs text-text-light">{sub.annotation}</p>
                      </div>
                    ) : (
                      <button onClick={() => {
                        const grade = prompt(lang === "ar" ? "الدرجة:" : "Grade:");
                        if (grade) handleGrade(sub.id, Number(grade), prompt(lang === "ar" ? "ملاحظات:" : "Notes:") || "", Number(prompt(lang === "ar" ? "المكافأة:" : "Reward:") || "0"));
                      }} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs cursor-pointer border-none">{lang === "ar" ? "تصحيح" : "Grade"}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homework.map(h => (
            <div key={h.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
              <h4 className="font-semibold">{h.title}</h4>
              <p className="text-xs text-text-light">{h.courseName} • {lang === "ar" ? "تسليم:" : "Due:"} {h.dueDate}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => loadSubs(h.id)} className="px-3 py-1.5 rounded-lg bg-bg text-sm cursor-pointer border-none"><IoEye /></button>
                <button onClick={() => openEdit("homework", h)} className="px-3 py-1.5 rounded-lg bg-bg text-sm cursor-pointer border-none"><FaPencilAlt /></button>
                <button onClick={() => handleDelete("homework", h.id)} className="px-3 py-1.5 rounded-lg bg-bg text-red-500 text-sm cursor-pointer border-none"><IoTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ====== REPORTS ======
const ReportsTab = memo(function ReportsTab(p: AdminTabProps) {
  const { lang, reports, students, showModal, setShowModal, modalType, form, setForm, handleSubmit, handleDelete, loadAll, openAdd } = p;
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "التقارير الشهرية" : "Monthly Reports"} ({reports.length})</h3>
        <button onClick={() => { setForm({ studentId: students[0]?.id || "", month: "", attendance: 0, grades: "", notes: "" }); openAdd("report"); }} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إضافة تقرير" : "Add Report"}</button>
      </div>
      {showModal && modalType === "report" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{lang === "ar" ? "تقرير شهري" : "Monthly Report"}</h3><button onClick={() => setShowModal(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required>
                <option value="">{lang === "ar" ? "اختر الطالب" : "Select Student"}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
              <input type="number" placeholder={lang === "ar" ? "نسبة الحضور" : "Attendance %"} value={form.attendance} onChange={e => setForm({ ...form, attendance: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
              <input placeholder={lang === "ar" ? "الدرجات" : "Grades"} value={form.grades} onChange={e => setForm({ ...form, grades: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
              <textarea placeholder={lang === "ar" ? "ملاحظات" : "Notes"} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={3} />
              <button type="submit" className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "إرسال التقرير" : "Send Report"}</button>
            </form>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map(r => {
          const student = students.find(s => s.id === r.studentId);
          return (
            <div key={r.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">{r.studentName || student?.name || r.studentId} - {r.month}</h4>
                <button onClick={() => handleDelete("report", r.id)} className="cursor-pointer bg-transparent border-none text-red-500"><IoTrash /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div><span className="text-text-light">{lang === "ar" ? "الحضور:" : "Attendance:"}</span> {r.attendance}%</div>
                <div><span className="text-text-light">{lang === "ar" ? "الدرجات:" : "Grades:"}</span> {r.grades}</div>
              </div>
              {r.notes && <p className="text-sm text-text-light mt-2">{r.notes}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ====== NOTIFICATIONS ======
const NotificationsTab = memo(function NotificationsTab(p: AdminTabProps) {
  const { lang, notifications, showModal, setShowModal, modalType, form, setForm, handleSubmit, loadAll, openAdd } = p;
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold">{lang === "ar" ? "الإشعارات" : "Notifications"} ({notifications.length})</h3>
        <button onClick={() => { setForm({ title: "", body: "" }); openAdd("notif"); }} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoAdd /> {lang === "ar" ? "إرسال إشعار" : "Send Notification"}</button>
      </div>
      {showModal && modalType === "notif" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{lang === "ar" ? "إرسال إشعار" : "Send Notification"}</h3><button onClick={() => setShowModal(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder={lang === "ar" ? "العنوان" : "Title"} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
              <textarea placeholder={lang === "ar" ? "المحتوى" : "Body"} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={3} required />
              <button type="submit" className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none"><IoPaperPlane /> {lang === "ar" ? "إرسال للجميع" : "Send to All"}</button>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
        {notifications.map(n => (
          <div key={n.id} className="flex justify-between items-start py-3 border-b border-border last:border-b-0">
            <div>
              <h4 className="font-semibold text-sm">{n.title}</h4>
              <p className="text-sm text-text-light">{n.body}</p>
            </div>
            <button onClick={() => { deleteNotification(n.id); loadAll(); }} className="text-red-500 cursor-pointer bg-transparent border-none"><IoTrash /></button>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-text-light text-center py-4">{lang === "ar" ? "لا توجد إشعارات" : "No notifications"}</p>}
      </div>
    </div>
  );
});

// ====== SETTINGS ======
const SettingsTab = memo(function SettingsTab(p: AdminTabProps) {
  const { lang, user } = p;
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const handleUpdateEmail = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { updateEmail, reauthenticateWithCredential, EmailAuthProvider } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const credential = EmailAuthProvider.credential(user!.email!, emailForm.password);
      await reauthenticateWithCredential(user!, credential);
      await updateEmail(user!, emailForm.email);
      alert(lang === "ar" ? "تم تحديث البريد" : "Email updated");
    } catch (err: any) { alert(err.message); }
  };
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { alert(lang === "ar" ? "كلمة المرور غير متطابقة" : "Passwords don't match"); return; }
    try {
      const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const credential = EmailAuthProvider.credential(user!.email!, passForm.currentPassword);
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, passForm.newPassword);
      alert(lang === "ar" ? "تم تحديث كلمة المرور" : "Password updated");
    } catch (err: any) { alert(err.message); }
  };
  return (
    <div className="max-w-lg space-y-8">
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
        <h4 className="font-semibold mb-4">{lang === "ar" ? "تغيير البريد الإلكتروني" : "Change Email"}</h4>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <input placeholder={lang === "ar" ? "البريد الجديد" : "New Email"} value={emailForm.email} onChange={e => setEmailForm({ ...emailForm, email: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
          <input type="password" placeholder={lang === "ar" ? "كلمة المرور الحالية" : "Current Password"} value={emailForm.password} onChange={e => setEmailForm({ ...emailForm, password: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
          <button type="submit" className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "تحديث" : "Update"}</button>
        </form>
      </div>
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
        <h4 className="font-semibold mb-4">{lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}</h4>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <input type="password" placeholder={lang === "ar" ? "كلمة المرور الحالية" : "Current Password"} value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
          <input type="password" placeholder={lang === "ar" ? "كلمة المرور الجديدة" : "New Password"} value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
          <input type="password" placeholder={lang === "ar" ? "تأكيد كلمة المرور" : "Confirm New Password"} value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
          <button type="submit" className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "تحديث" : "Update"}</button>
        </form>
      </div>
    </div>
  );
});

// ====== MODAL ======
const Modal = memo(function Modal(p: AdminTabProps) {
  const { showModal, setShowModal, modalType, lang, form, setForm, editId, courses, handleSubmit, openAdd } = p;
  if (!showModal || modalType === "exam" || modalType === "report" || modalType === "notif" || modalType === "wallet" || modalType === "promo") return null;
  const titleMap = { course: lang === "ar" ? "إضافة/تعديل كورس" : "Add/Edit Course", lesson: lang === "ar" ? "إضافة/تعديل درس" : "Add/Edit Lesson", homework: lang === "ar" ? "إضافة/تعديل واجب" : "Add/Edit Homework" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
      <div className="bg-white rounded-[20px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{titleMap[modalType]}</h3><button onClick={() => setShowModal(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalType === "course" && (
            <><input placeholder={lang === "ar" ? "اسم الكورس" : "Course Name"} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
            <input placeholder={lang === "ar" ? "المرحلة" : "Grade"} value={form.grade || ""} onChange={e => setForm({ ...form, grade: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
            <select value={form.courseType || "lessons"} onChange={e => setForm({ ...form, courseType: e.target.value, videoUrl: "", embedCode: "" })} className="w-full px-4 py-3 border border-border rounded-xl text-sm"><option value="lessons">{lang === "ar" ? "دروس نصية" : "Text Lessons"}</option><option value="video">{lang === "ar" ? "فيديو" : "Video Course"}</option></select>
            {form.courseType === "video" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-light">{lang === "ar" ? "رابط الفيديو (يوتيوب)" : "Video URL (YouTube)"}</label>
                  <input placeholder={lang === "ar" ? "رابط اليوتيوب" : "YouTube URL"} value={form.videoUrl || ""} onChange={e => { const v = e.target.value; let embed = form.embedCode; if (v.includes("youtube.com/watch")) { const id = v.split("v=")[1]?.split("&")[0]; if (id) embed = `https://www.youtube.com/embed/${id}`; } setForm({ ...form, videoUrl: v, embedCode: embed }); }} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-light">{lang === "ar" ? "كود التضمين (Embed)" : "Embed Code"}</label>
                  <textarea placeholder={lang === "ar" ? "كود التضمين (Embed)" : "Embed Code"} value={form.embedCode || ""} onChange={e => setForm({ ...form, embedCode: e.target.value, videoUrl: "" })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={3} />
                </div>
              </div>
            )}
            <textarea placeholder={lang === "ar" ? "الوصف" : "Description"} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={3} /></>
          )}
          {modalType === "lesson" && (
            <><input placeholder={lang === "ar" ? "عنوان الدرس" : "Lesson Title"} value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
            <select value={form.courseId || ""} onChange={e => setForm({ ...form, courseId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm"><option value="">{lang === "ar" ? "اختر الكورس (اختياري)" : "Select Course (optional)"}</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select value={form.lessonType || "text"} onChange={e => setForm({ ...form, lessonType: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm"><option value="text">{lang === "ar" ? "درس نصي" : "Text Lesson"}</option><option value="video">{lang === "ar" ? "درس فيديو" : "Video Lesson"}</option></select>
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "الصورة المصغرة (THUMBNAIL)" : "THUMBNAIL"}</label>
               <label className="flex items-center gap-2 px-4 py-3 border border-border rounded-xl text-sm cursor-pointer bg-white">
                 {form.thumbnail instanceof File ? form.thumbnail.name : (lang === "ar" ? "اختر صورة" : "Choose image")}
                 <input type="file" accept="image/png,image/jpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { if (!["image/png","image/jpeg"].includes(f.type)) { alert(lang === "ar" ? "الصيغة غير مدعومة (PNG/JPG فقط)" : "Unsupported format (PNG/JPG only)"); e.target.value = ""; return; } if (f.size > 2 * 1024 * 1024) { alert(lang === "ar" ? "حجم الصورة كبير جداً (الحد 2MB)" : "Image too large (max 2MB)"); e.target.value = ""; return; } setForm({ ...form, thumbnail: f }); }}} className="hidden" />
               </label>
             </div>
             {form.thumbnail && typeof form.thumbnail === "string" && <img src={form.thumbnail} className="w-full h-32 object-cover rounded-xl" alt="thumbnail" />}
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "رابط الفيديو (يوتيوب)" : "Video URL (YouTube)"}</label>
               <input placeholder={lang === "ar" ? "رابط الفيديو" : "Video URL"} value={form.videoUrl || ""} onChange={e => { const v = e.target.value; let embed = form.embedCode; if (v.includes("youtube.com/watch")) { const id = v.split("v=")[1]?.split("&")[0]; if (id) embed = `https://www.youtube.com/embed/${id}`; } setForm({ ...form, videoUrl: v, embedCode: embed }); }} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "كود التضمين (Embed)" : "Embed Code"}</label>
               <textarea placeholder={lang === "ar" ? "كود التضمين (Embed)" : "Embed Code"} value={form.embedCode || ""} onChange={e => setForm({ ...form, embedCode: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={3} />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "رابط PDF" : "PDF URL"}</label>
               <input placeholder={lang === "ar" ? "رابط PDF" : "PDF URL"} value={form.pdfUrl || ""} onChange={e => setForm({ ...form, pdfUrl: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "المحتوى" : "Content"}</label>
               <textarea placeholder={lang === "ar" ? "المحتوى" : "Content"} value={form.content || ""} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={4} />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "السعر (PRICE)" : "PRICE"}</label>
               <input type="number" placeholder={lang === "ar" ? "السعر" : "Price"} value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "حد المشاهدات (كام مره يقدر يشوف الدرس)" : "View Limit (how many times student can view)"}</label>
               <input type="number" placeholder={lang === "ar" ? "حد المشاهدات" : "View Limit"} value={form.viewLimit || 0} onChange={e => setForm({ ...form, viewLimit: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-medium text-text-light">{lang === "ar" ? "أكواد التفعيل (كود لكل سطر - الطالب يدخله عشان يفتح الدرس)" : "Access codes (one per line - student enters code to unlock)"}</label>
               <textarea placeholder={lang === "ar" ? "أكواد التفعيل" : "Access codes"} value={form.codes || ""} onChange={e => setForm({ ...form, codes: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={3} />
             </div></>
           )}
          {modalType === "homework" && (
            <><input placeholder={lang === "ar" ? "عنوان الواجب" : "Homework Title"} value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
            <select value={form.courseId || ""} onChange={e => setForm({ ...form, courseId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm"><option value="">{lang === "ar" ? "اختر الكورس (اختياري)" : "Select Course (optional)"}</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <input type="date" value={form.dueDate || ""} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
            <textarea placeholder={lang === "ar" ? "الأسئلة (سؤال لكل سطر)" : "Questions (one per line)"} value={form.questions || ""} onChange={e => setForm({ ...form, questions: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={6} required /></>
          )}

          <button type="submit" className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">
            {editId ? (lang === "ar" ? "تحديث" : "Update") : (lang === "ar" ? "إضافة" : "Create")}
          </button>
        </form>
      </div>
    </div>
  );
});

export default function AdminDashboard() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<ATab>("overview");
  const { user, loading, userRole, logout } = useAuth();
  const router = useRouter();

  // Data states
  const [students, setStudents] = useState<AppUser[]>([]);
  const [pendingStudents, setPendingStudents] = useState<AppUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [files, setFiles] = useState<AppFile[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [walletPromos, setWalletPromos] = useState<WalletPromo[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("course");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [walletForm, setWalletForm] = useState({ studentId: "", txType: "credit" as "credit" | "debit", amount: 0, description: "" });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [promoForm, setPromoForm] = useState({ promoAmount: 0, promoMaxUses: 1, promoExpires: "" });
  const [showPromoModal, setShowPromoModal] = useState(false);

  useEffect(() => { setLang(document.documentElement.lang === "ar" ? "ar" : "en"); }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (userRole && userRole !== "admin") router.push("/");
    }
  }, [user, loading, userRole, router]);

  useEffect(() => {
    if (user && userRole === "admin") loadAll();
  }, [user, userRole]);

  const loadAll = async () => {
    setLoadingData(true);
    const safe = <T,>(p: Promise<T>): Promise<T> => p.catch(e => { console.error(e); return [] as any; });
    const [s, p, c, l, e, er, h, f, tx, wp, r, n] = await Promise.all([
      safe(fetchStudents()), safe(fetchPendingStudents()), safe(fetchCourses()), safe(fetchLessons()),
      safe(fetchExams()), safe(fetchExamResults()), safe(fetchHomework()), safe(fetchFiles()),
      safe(fetchTransactions()), safe(fetchWalletPromos()), safe(fetchReports()), safe(fetchNotifications())
    ]);
    setStudents(s); setPendingStudents(p); setCourses(c); setLessons(l);
    setExams(e); setExamResults(er); setHomework(h); setFiles(f);
    setTransactions(tx); setWalletPromos(wp); setReports(r); setNotifications(n);
    setLoadingData(false);
  };

  const t = (key: string) => getTranslation(lang, key);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-bg"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  // === MODAL HANDLERS ===
  const openAdd = (type: ModalType) => { setModalType(type); setEditId(null); setForm({}); setSelectedFile(null); setShowModal(true); };
  const openEdit = (type: ModalType, item: any) => { setModalType(type); setEditId(item.id); setForm(item); setShowModal(true); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const map: Record<string, string> = { course: "courses", lesson: "lessons", exam: "exams", homework: "homework" };
    const col = map[modalType];
    if (modalType === "course") { if (editId) await saveCourse(editId, form); else await saveCourse(null, form); }
     else if (modalType === "lesson") {
       const { thumbnail: thumbFile, ...restForm } = form;
       let thumbnailUrl = editId ? form.thumbnail : undefined;
       if (thumbFile instanceof File) {
         const allowedTypes = ["image/png", "image/jpeg"];
         if (!allowedTypes.includes(thumbFile.type)) { alert(lang === "ar" ? "الصيغة غير مدعومة (PNG/JPG فقط)" : "Unsupported format (PNG/JPG only)"); return; }
         if (thumbFile.size > 2 * 1024 * 1024) { alert(lang === "ar" ? "حجم الصورة كبير جداً (الحد 2MB)" : "Image too large (max 2MB)"); return; }
          thumbnailUrl = (await uploadFile(thumbFile, "lesson-thumbnails")).url;
       }
       const data = { ...restForm, thumbnail: thumbnailUrl, codes: form.codes ? form.codes.split("\n").map((c: string) => c.trim()).filter(Boolean) : [], viewers: form.viewers || {} };
       if (editId) await saveLesson(editId, data); else await saveLesson(null, data);
     }
    else if (modalType === "exam") {
      const data = { ...form };
      if (editId) await saveExam(editId, data); else await saveExam(null, data);
    }
    else if (modalType === "homework") { if (editId) await saveHomework(editId, form); else await saveHomework(null, form); }
    else if (modalType === "wallet") { await addTransaction(form.studentId, form.txType, Number(form.amount), form.description); }
    else if (modalType === "promo") {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = ""; for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
      await createWalletPromo(code, Number(form.promoAmount) || 0, Number(form.promoMaxUses) || 1, form.promoExpires ? new Date(form.promoExpires) : null);
    }
    else if (modalType === "report") { const s = students.find(x => x.id === form.studentId); await saveReport({ ...form, studentName: s?.name || "" }); }
    else if (modalType === "notif") { await sendNotification({ title: form.title, body: form.body, forStudents: true }); }
    setShowModal(false);
    loadAll();
  };

  const handleDelete = async (type: "course" | "lesson" | "exam" | "homework" | "report", id: string) => {
    if (type === "course") await deleteCourse(id);
    else if (type === "lesson") await deleteLesson(id);
    else if (type === "exam") await deleteExam(id);
    else if (type === "homework") await deleteHomework(id);
    else if (type === "report") await deleteReport(id);
    else await deleteHomework(id);
    loadAll();
  };

  const handleGrade = async (subId: string, grade: number, annotation: string, reward: number) => {
    await gradeSubmission(subId, grade, annotation, reward);
    loadAll();
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    const { url, publicId } = await uploadFile(selectedFile, "files");
    await saveFile({ name: selectedFile.name, url, publicId, type: selectedFile.type, size: selectedFile.size, isPublic: form.isPublic !== false, lessonId: form.lessonId || "" });
    setSelectedFile(null);
    loadAll();
  };

  // === SIDEBAR ===
  const sidebarItems: { key: ATab; icon: any; label: string }[] = [
    { key: "overview", icon: IoGrid, label: lang === "ar" ? "نظرة عامة" : "Overview" },
    { key: "students", icon: FaUsers, label: lang === "ar" ? "الطلاب" : "Students" },
    { key: "requests", icon: IoPeople, label: lang === "ar" ? "طلبات التسجيل" : "Requests" },
    { key: "courses", icon: FaBookOpen, label: lang === "ar" ? "الكورسات" : "Courses" },
    { key: "lessons", icon: IoBook, label: lang === "ar" ? "الدروس" : "Lessons" },
    { key: "files", icon: FaFileAlt, label: lang === "ar" ? "الملفات" : "Files" },
    { key: "wallet", icon: IoWallet, label: lang === "ar" ? "المحفظة" : "Wallet" },
    { key: "wallet-promos", icon: IoLink, label: lang === "ar" ? "قسائم المحفظة" : "Wallet Promos" },
    { key: "exams", icon: IoCreate, label: lang === "ar" ? "الامتحانات" : "Exams" },
    { key: "homework", icon: IoDocumentText, label: lang === "ar" ? "الواجبات" : "Homework" },
    { key: "reports", icon: IoStatsChart, label: lang === "ar" ? "التقارير" : "Reports" },
    { key: "notifications", icon: IoNotifications, label: lang === "ar" ? "الإشعارات" : "Notifications" },
    { key: "settings", icon: IoSettings, label: lang === "ar" ? "الإعدادات" : "Settings" },
  ];

  const tabProps: AdminTabProps = {
    lang, user, students, pendingStudents, courses, lessons, exams, examResults,
    homework, files, transactions, walletPromos, reports, notifications,
    showModal, setShowModal, modalType, form, setForm, editId,
    selectedFile, setSelectedFile, walletForm, setWalletForm, showWalletModal, setShowWalletModal,
    promoForm, setPromoForm, showPromoModal, setShowPromoModal,
    loadAll, handleSubmit, handleDelete, handleGrade, handleFileUpload, openAdd, openEdit,
  };

  const renderTab = () => {
    switch (tab) {
      case "overview": return <OverviewTab {...tabProps} />;
      case "students": return <StudentsTab {...tabProps} />;
      case "requests": return <RequestsTab {...tabProps} />;
      case "courses": return <CoursesTab {...tabProps} />;
      case "lessons": return <LessonsTab {...tabProps} />;
      case "files": return <FilesTab {...tabProps} />;
      case "wallet": return <WalletTab {...tabProps} />;
       case "wallet-promos": return <WalletPromosTab {...tabProps} />;
      case "exams": return <ExamsTab {...tabProps} />;
      case "homework": return <HomeworkTab {...tabProps} />;
      case "reports": return <ReportsTab {...tabProps} />;
      case "notifications": return <NotificationsTab {...tabProps} />;
      case "settings": return <SettingsTab {...tabProps} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg" dir={lang === "ar" ? "rtl" : "ltr"}>
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-[260px] bg-[#1F2937] text-white/80 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-white"><img src="https://i.ibb.co/C5gmLKTG/Favicon.png" alt="Logo" className="w-7 h-7 rounded-full object-cover" /> Admin</Link>
        </div>
        <nav className="p-3 flex-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <a key={item.key} href="#" onClick={e => { e.preventDefault(); setTab(item.key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 mb-0.5 cursor-pointer ${tab === item.key ? "bg-gradient-to-r from-primary to-accent text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
              <item.icon className="text-sm w-5 text-center" /> {item.label}
            </a>
          ))}
          <a href="#" onClick={e => { e.preventDefault(); logout(); router.push("/"); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 mt-4 cursor-pointer">
            <IoLogOut className="text-sm w-5 text-center" /> {lang === "ar" ? "تسجيل الخروج" : "Logout"}
          </a>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 p-6 md:p-8 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-xl text-text" onClick={() => setSidebarOpen(true)}><IoMenu /></button>
            <h2 className="text-xl md:text-2xl font-bold">{sidebarItems.find(s => s.key === tab)?.label}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="relative">
              <IoNotifications className="text-xl text-text-light cursor-pointer" />
              {pendingStudents.length > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">{pendingStudents.length}</span>}
            </span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">{user?.email?.charAt(0).toUpperCase() || "A"}</div>
          </div>
        </div>

        {loadingData ? <div className="text-center py-12"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div> : renderTab()}
      </div>

      <Modal {...tabProps} />
    </div>
  );
}


