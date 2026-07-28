"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  IoSchool, IoNotifications, IoLogOut, IoMenu, IoGrid, IoPeople,
  IoBook, IoCreate, IoDocumentText, IoTrash, IoCheckmarkCircle,
  IoCloseCircle, IoBan, IoAdd, IoClose, IoArrowBack
} from "react-icons/io5";
import { FaUserGraduate, FaUsers, FaBookOpen, FaPencilAlt, FaChalkboardTeacher } from "react-icons/fa";
import { getTranslation } from "@/lib/i18n";

type TabKey = "overview" | "students" | "courses" | "lessons" | "exams" | "homework";

interface Student {
  id: string; name: string; email: string; phone: string; status: string; createdAt?: any;
}

interface Course {
  id: string; name: string; grade: string; description: string; createdAt?: any;
}

interface Lesson {
  id: string; title: string; courseId: string; courseName?: string; videoUrl: string; pdfUrl: string; content: string; order: number; createdAt?: any;
}

interface Exam {
  id: string; title: string; courseId: string; courseName?: string; questions: string; createdAt?: any;
}

interface Homework {
  id: string; title: string; courseId: string; courseName?: string; dueDate: string; questions: string; createdAt?: any;
}

const sidebarLinks: { icon: any; label: string; key: TabKey }[] = [
  { icon: IoGrid, label: "overview", key: "overview" },
  { icon: FaUsers, label: "users", key: "students" },
  { icon: FaBookOpen, label: "courses", key: "courses" },
  { icon: FaPencilAlt, label: "homework", key: "lessons" },
  { icon: IoDocumentText, label: "assignments", key: "exams" },
  { icon: IoCreate, label: "assignments", key: "homework" },
];

export default function AdminDashboard() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { user, loading, userRole, logout } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"course" | "lesson" | "exam" | "homework">("course");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "en");
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (userRole && userRole !== "admin") router.push("/");
    }
  }, [user, loading, userRole, router]);

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchStudents();
      fetchCourses();
      fetchLessons();
      fetchExams();
      fetchHomework();
    }
  }, [user, userRole]);

  const t = (key: string) => getTranslation(lang, key);

  const fetchStudents = async () => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Student[] = [];
    snap.forEach(d => {
      const dta = d.data();
      if (dta.role === "student") {
        list.push({ id: d.id, name: dta.name || "", email: dta.email || "", phone: dta.phone || "", status: dta.status || "active", createdAt: dta.createdAt });
      }
    });
    setStudents(list);
  };

  const fetchCourses = async () => {
    setDataLoading(true);
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Course[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Course));
    setCourses(list);
    setDataLoading(false);
  };

  const fetchLessons = async () => {
    const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Lesson[] = [];
    for (const d of snap.docs) {
      const dta = d.data();
      const courseSnap = await getDoc(doc(db, "courses", dta.courseId || "none"));
      list.push({ id: d.id, ...dta, courseName: courseSnap.exists() ? courseSnap.data().name : "" } as Lesson);
    }
    setLessons(list);
  };

  const fetchExams = async () => {
    const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Exam[] = [];
    for (const d of snap.docs) {
      const dta = d.data();
      const courseSnap = await getDoc(doc(db, "courses", dta.courseId || "none"));
      list.push({ id: d.id, ...dta, courseName: courseSnap.exists() ? courseSnap.data().name : "" } as Exam);
    }
    setExams(list);
  };

  const fetchHomework = async () => {
    const q = query(collection(db, "homework"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Homework[] = [];
    for (const d of snap.docs) {
      const dta = d.data();
      const courseSnap = await getDoc(doc(db, "courses", dta.courseId || "none"));
      list.push({ id: d.id, ...dta, courseName: courseSnap.exists() ? courseSnap.data().name : "" } as Homework);
    }
    setHomework(list);
  };

  const updateStudentStatus = async (studentId: string, newStatus: string) => {
    await updateDoc(doc(db, "users", studentId), { status: newStatus });
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const deleteStudent = async (studentId: string) => {
    await deleteDoc(doc(db, "users", studentId));
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const openAddModal = (type: "course" | "lesson" | "exam" | "homework") => {
    setModalType(type);
    setEditId(null);
    setForm({});
    setShowModal(true);
  };

  const openEditModal = (type: "course" | "lesson" | "exam" | "homework", item: any) => {
    setModalType(type);
    setEditId(item.id);
    setForm(item);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const collectionMap = { course: "courses", lesson: "lessons", exam: "exams", homework: "homework" };
    const colName = collectionMap[modalType];
    const data = { ...form };
    if (!editId) {
      data.createdAt = serverTimestamp();
      const ref = doc(collection(db, colName));
      await setDoc(ref, data);
    } else {
      await updateDoc(doc(db, colName, editId), data);
    }
    setShowModal(false);
    if (modalType === "course") fetchCourses();
    else if (modalType === "lesson") fetchLessons();
    else if (modalType === "exam") fetchExams();
    else fetchHomework();
  };

  const deleteItem = async (type: "course" | "lesson" | "exam" | "homework", id: string) => {
    const collectionMap = { course: "courses", lesson: "lessons", exam: "exams", homework: "homework" };
    await deleteDoc(doc(db, collectionMap[type], id));
    if (type === "course") setCourses(prev => prev.filter(c => c.id !== id));
    else if (type === "lesson") setLessons(prev => prev.filter(l => l.id !== id));
    else if (type === "exam") setExams(prev => prev.filter(e => e.id !== id));
    else setHomework(prev => prev.filter(h => h.id !== id));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "banned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusText = (status: string) => {
    if (lang === "ar") {
      switch (status) {
        case "active": return "نشط";
        case "pending": return "قيد المراجعة";
        case "banned": return "محظور";
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderModal = () => {
    if (!showModal) return null;
    const titleMap = {
      course: lang === "ar" ? "إضافة/تعديل كورس" : "Add/Edit Course",
      lesson: lang === "ar" ? "إضافة/تعديل حصة" : "Add/Edit Lesson",
      exam: lang === "ar" ? "إضافة/تعديل امتحان" : "Add/Edit Exam",
      homework: lang === "ar" ? "إضافة/تعديل واجب" : "Add/Edit Homework",
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-[20px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{titleMap[modalType]}</h3>
            <button onClick={() => setShowModal(false)} className="text-text-light hover:text-text text-xl cursor-pointer border-none bg-transparent"><IoClose /></button>
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {modalType === "course" && (
              <>
                <input placeholder={lang === "ar" ? "اسم الكورس" : "Course Name"} value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
                <input placeholder={lang === "ar" ? "المرحلة (مثال: Grade 5)" : "Grade (e.g. Grade 5)"} value={form.grade || ""} onChange={e => setForm({ ...form, grade: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
                <textarea placeholder={lang === "ar" ? "الوصف" : "Description"} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={3} />
              </>
            )}
            {modalType === "lesson" && (
              <>
                <input placeholder={lang === "ar" ? "عنوان الحصة" : "Lesson Title"} value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
                <select value={form.courseId || ""} onChange={e => setForm({ ...form, courseId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required>
                  <option value="">{lang === "ar" ? "اختر الكورس" : "Select Course"}</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input placeholder={lang === "ar" ? "رابط الفيديو" : "Video URL"} value={form.videoUrl || ""} onChange={e => setForm({ ...form, videoUrl: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
                <input placeholder={lang === "ar" ? "رابط PDF" : "PDF URL"} value={form.pdfUrl || ""} onChange={e => setForm({ ...form, pdfUrl: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
                <textarea placeholder={lang === "ar" ? "محتوى الحصة" : "Lesson Content"} value={form.content || ""} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={4} />
                <input type="number" placeholder={lang === "ar" ? "الترتيب" : "Order"} value={form.order || 0} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
              </>
            )}
            {modalType === "exam" && (
              <>
                <input placeholder={lang === "ar" ? "عنوان الامتحان" : "Exam Title"} value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
                <select value={form.courseId || ""} onChange={e => setForm({ ...form, courseId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required>
                  <option value="">{lang === "ar" ? "اختر الكورس" : "Select Course"}</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <textarea placeholder={lang === "ar" ? "الأسئلة (سؤال لكل سطر)" : "Questions (one per line)"} value={form.questions || ""} onChange={e => setForm({ ...form, questions: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={6} required />
              </>
            )}
            {modalType === "homework" && (
              <>
                <input placeholder={lang === "ar" ? "عنوان الواجب" : "Homework Title"} value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
                <select value={form.courseId || ""} onChange={e => setForm({ ...form, courseId: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required>
                  <option value="">{lang === "ar" ? "اختر الكورس" : "Select Course"}</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="date" value={form.dueDate || ""} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" required />
                <textarea placeholder={lang === "ar" ? "الأسئلة (سؤال لكل سطر)" : "Questions (one per line)"} value={form.questions || ""} onChange={e => setForm({ ...form, questions: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" rows={6} required />
              </>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-medium text-text-light hover:bg-bg transition-all cursor-pointer">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-1px] transition-all duration-300 cursor-pointer">
                {editId ? (lang === "ar" ? "تحديث" : "Update") : (lang === "ar" ? "إضافة" : "Create")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { icon: FaUsers, bg: "bg-primary-light", color: "text-primary", value: String(students.length + 1), label: "totalUsers" },
                { icon: FaChalkboardTeacher, bg: "bg-[rgba(79,70,229,0.1)]", color: "text-accent", value: "1", label: "teachers" },
                { icon: FaUserGraduate, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", value: String(students.length), label: "students" },
                { icon: FaBookOpen, bg: "bg-[rgba(59,130,246,0.1)]", color: "text-blue-600", value: String(courses.length), label: "courses" },
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
                <h4 className="text-base font-semibold mb-4">{lang === "ar" ? "آخر الطلاب المسجلين" : "Recent Students"}</h4>
                <div className="space-y-3">
                  {students.slice(0, 5).map(s => (
                    <div key={s.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                      <div>
                        <span className="text-sm font-medium block">{s.name}</span>
                        <span className="text-xs text-text-lighter">{s.email}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(s.status)}`}>{statusText(s.status)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
                <h4 className="text-base font-semibold mb-4">{lang === "ar" ? "آخر الكورسات" : "Recent Courses"}</h4>
                <div className="space-y-3">
                  {courses.slice(0, 5).map(c => (
                    <div key={c.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-text-lighter">{c.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "students":
        return (
          <>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">
                {lang === "ar" ? "إدارة الطلاب" : "Student Management"}
                <span className="text-sm text-text-light ml-2">({students.length})</span>
              </h3>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {["name", "email", ...(lang === "ar" ? ["الحالة", "إجراءات"] : ["status", "actions"])].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider whitespace-nowrap">{h === "name" || h === "email" ? t(h) : h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-text-light">{lang === "ar" ? "لا يوجد طلاب بعد" : "No students yet"}</td></tr>
                  ) : students.map(s => (
                    <tr key={s.id} className="hover:bg-bg transition-colors">
                      <td className="px-4 py-3.5 border-b border-border font-medium">{s.name}</td>
                      <td className="px-4 py-3.5 border-b border-border text-text-light">{s.email}</td>
                      <td className="px-4 py-3.5 border-b border-border">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(s.status)}`}>{statusText(s.status)}</span>
                      </td>
                      <td className="px-4 py-3.5 border-b border-border">
                        <div className="flex gap-2">
                          {s.status === "pending" && (
                            <button onClick={() => updateStudentStatus(s.id, "active")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-all cursor-pointer border-none" title={lang === "ar" ? "قبول" : "Approve"}>
                              <IoCheckmarkCircle />
                            </button>
                          )}
                          {s.status === "active" && (
                            <button onClick={() => updateStudentStatus(s.id, "banned")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-all cursor-pointer border-none" title={lang === "ar" ? "حظر" : "Ban"}>
                              <IoBan />
                            </button>
                          )}
                          {s.status === "banned" && (
                            <button onClick={() => updateStudentStatus(s.id, "active")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-all cursor-pointer border-none" title={lang === "ar" ? "إلغاء الحظر" : "Unban"}>
                              <IoCheckmarkCircle />
                            </button>
                          )}
                          <button onClick={() => deleteStudent(s.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer border-none" title={lang === "ar" ? "حذف" : "Delete"}>
                            <IoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case "courses":
        return (
          <>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">{lang === "ar" ? "الكورسات" : "Courses"} <span className="text-sm text-text-light ml-2">({courses.length})</span></h3>
              <button onClick={() => openAddModal("course")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-1px] transition-all duration-300 cursor-pointer border-none">
                <IoAdd /> {lang === "ar" ? "إضافة كورس" : "Add Course"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.length === 0 ? (
                <div className="col-span-full text-center py-12 text-text-light">{lang === "ar" ? "لا يوجد كورسات بعد" : "No courses yet"}</div>
              ) : courses.map(c => (
                <div key={c.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <span className="text-xs text-primary bg-primary-light px-2.5 py-0.5 rounded-full inline-block mt-1">{c.grade}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEditModal("course", c)} className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center text-text-light hover:text-primary hover:bg-primary-light transition-all cursor-pointer border-none"><FaPencilAlt className="text-xs" /></button>
                      <button onClick={() => deleteItem("course", c.id)} className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center text-text-light hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border-none"><IoTrash /></button>
                    </div>
                  </div>
                  <p className="text-xs text-text-light line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          </>
        );

      case "lessons":
        return (
          <>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">{lang === "ar" ? "الحصص" : "Lessons"} <span className="text-sm text-text-light ml-2">({lessons.length})</span></h3>
              <button onClick={() => openAddModal("lesson")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-1px] transition-all duration-300 cursor-pointer border-none">
                <IoAdd /> {lang === "ar" ? "إضافة حصة" : "Add Lesson"}
              </button>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "العنوان" : "Title"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "الكورس" : "Course"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "الترتيب" : "Order"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-text-light">{lang === "ar" ? "لا يوجد حصص بعد" : "No lessons yet"}</td></tr>
                  ) : lessons.map(l => (
                    <tr key={l.id} className="hover:bg-bg transition-colors">
                      <td className="px-4 py-3.5 border-b border-border font-medium">{l.title}</td>
                      <td className="px-4 py-3.5 border-b border-border text-text-light">{l.courseName || l.courseId}</td>
                      <td className="px-4 py-3.5 border-b border-border">{l.order || 0}</td>
                      <td className="px-4 py-3.5 border-b border-border">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal("lesson", l)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg text-text-light text-xs font-medium hover:text-primary hover:bg-primary-light transition-all cursor-pointer border-none"><FaPencilAlt /></button>
                          <button onClick={() => deleteItem("lesson", l.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg text-text-light text-xs font-medium hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border-none"><IoTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case "exams":
        return (
          <>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">{lang === "ar" ? "الامتحانات" : "Exams"} <span className="text-sm text-text-light ml-2">({exams.length})</span></h3>
              <button onClick={() => openAddModal("exam")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-1px] transition-all duration-300 cursor-pointer border-none">
                <IoAdd /> {lang === "ar" ? "إضافة امتحان" : "Add Exam"}
              </button>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "العنوان" : "Title"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "الكورس" : "Course"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "عدد الأسئلة" : "Questions"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-text-light">{lang === "ar" ? "لا يوجد امتحانات بعد" : "No exams yet"}</td></tr>
                  ) : exams.map(e => (
                    <tr key={e.id} className="hover:bg-bg transition-colors">
                      <td className="px-4 py-3.5 border-b border-border font-medium">{e.title}</td>
                      <td className="px-4 py-3.5 border-b border-border text-text-light">{e.courseName || e.courseId}</td>
                      <td className="px-4 py-3.5 border-b border-border">{(e.questions || "").split("\n").filter(Boolean).length}</td>
                      <td className="px-4 py-3.5 border-b border-border">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal("exam", e)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg text-text-light text-xs font-medium hover:text-primary hover:bg-primary-light transition-all cursor-pointer border-none"><FaPencilAlt /></button>
                          <button onClick={() => deleteItem("exam", e.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg text-text-light text-xs font-medium hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border-none"><IoTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case "homework":
        return (
          <>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">{lang === "ar" ? "الواجبات" : "Homework"} <span className="text-sm text-text-light ml-2">({homework.length})</span></h3>
              <button onClick={() => openAddModal("homework")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_rgba(0,191,166,0.3)] hover:translate-y-[-1px] transition-all duration-300 cursor-pointer border-none">
                <IoAdd /> {lang === "ar" ? "إضافة واجب" : "Add Homework"}
              </button>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "العنوان" : "Title"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "الكورس" : "Course"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "تاريخ التسليم" : "Due Date"}</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-light border-b-2 border-border text-xs uppercase tracking-wider">{lang === "ar" ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {homework.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-text-light">{lang === "ar" ? "لا يوجد واجبات بعد" : "No homework yet"}</td></tr>
                  ) : homework.map(h => (
                    <tr key={h.id} className="hover:bg-bg transition-colors">
                      <td className="px-4 py-3.5 border-b border-border font-medium">{h.title}</td>
                      <td className="px-4 py-3.5 border-b border-border text-text-light">{h.courseName || h.courseId}</td>
                      <td className="px-4 py-3.5 border-b border-border">{h.dueDate}</td>
                      <td className="px-4 py-3.5 border-b border-border">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal("homework", h)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg text-text-light text-xs font-medium hover:text-primary hover:bg-primary-light transition-all cursor-pointer border-none"><FaPencilAlt /></button>
                          <button onClick={() => deleteItem("homework", h.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg text-text-light text-xs font-medium hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border-none"><IoTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-[260px] bg-[#1F2937] text-white/80 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-white">
            <IoSchool className="text-primary" />
            Admin
          </Link>
        </div>
        <nav className="p-3 flex-1 overflow-y-auto">
          {[
            { icon: IoGrid, label: "overview", key: "overview" as TabKey },
            { icon: FaUsers, label: "users", key: "students" as TabKey },
            { icon: FaBookOpen, label: "courses", key: "courses" as TabKey },
            { icon: FaPencilAlt, label: "homework", key: "lessons" as TabKey },
            { icon: IoDocumentText, label: "assignments", key: "exams" as TabKey },
            { icon: IoCreate, label: "assignments", key: "homework" as TabKey },
          ].map((item) => (
            <a
              key={item.key}
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab(item.key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 mb-0.5 cursor-pointer ${
                activeTab === item.key
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="text-sm w-5 text-center" />
              <span>{t(item.label)}</span>
            </a>
          ))}
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); router.push("/"); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 mt-4 cursor-pointer">
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
            <h2 className="text-xl md:text-2xl font-bold">
              {activeTab === "overview" ? t("adminDash") :
               activeTab === "students" ? (lang === "ar" ? "إدارة الطلاب" : "Student Management") :
               activeTab === "courses" ? (lang === "ar" ? "الكورسات" : "Courses") :
               activeTab === "lessons" ? (lang === "ar" ? "الحصص" : "Lessons") :
               activeTab === "exams" ? (lang === "ar" ? "الامتحانات" : "Exams") :
               lang === "ar" ? "الواجبات" : "Homework"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-xl bg-bg border-none flex items-center justify-center text-text-light cursor-pointer transition-all duration-300 hover:bg-primary-light hover:text-primary">
              <IoNotifications className="text-lg" />
              {students.filter(s => s.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                  {students.filter(s => s.status === "pending").length}
                </span>
              )}
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

      {renderModal()}
    </div>
  );
}
