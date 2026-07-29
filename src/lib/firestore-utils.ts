import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  AppUser, Lesson, Course, Exam, ExamResult, Homework,
HomeworkSubmission, AppFile, WalletTransaction, Report, 
Notification, ChatMessage, WalletPromo
} from "./types";

// === Users ===
export async function fetchStudents() {
  const snap = await getDocs(collection(db, "users"));
  const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as AppUser));
  return list.filter(u => u.role === "student").sort((a, b) => ((b.createdAt as any)?.toDate?.() || 0) - ((a.createdAt as any)?.toDate?.() || 0));
}

export async function fetchActiveStudentsCount() {
  const q = query(collection(db, "users"), where("role", "==", "student"), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.size;
}

export async function fetchPendingStudents() {
  const snap = await getDocs(collection(db, "users"));
  const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as AppUser));
  return list.filter(u => u.role === "student" && u.status === "pending").sort((a, b) => ((b.createdAt as any)?.toDate?.() || 0) - ((a.createdAt as any)?.toDate?.() || 0));
}

export async function updateUserStatus(userId: string, status: string) {
  await updateDoc(doc(db, "users", userId), { status });
}

export async function deleteUser(userId: string) {
  await deleteDoc(doc(db, "users", userId));
}

export async function updateUserProfile(userId: string, data: Partial<AppUser>) {
  await updateDoc(doc(db, "users", userId), data);
}

// === Courses ===
export async function fetchCourses() {
  const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Course));
}

export async function saveCourse(id: string | null, data: any) {
  if (id) {
    await updateDoc(doc(db, "courses", id), data);
  } else {
    data.createdAt = serverTimestamp();
    const ref = doc(collection(db, "courses"));
    await setDoc(ref, data);
    return ref.id;
  }
}

export async function deleteCourse(id: string) {
  await deleteDoc(doc(db, "courses", id));
}

// === Lessons ===
export async function fetchLessons() {
  const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const list: Lesson[] = [];
  for (const d of snap.docs) {
    const dta = d.data() as Lesson;
    const courseSnap = await getDoc(doc(db, "courses", dta.courseId || "none"));
    list.push({ ...dta, id: d.id, courseName: courseSnap.exists() ? courseSnap.data().name : "" });
  }
  return list;
}

export async function saveLesson(id: string | null, data: any) {
  if (id) {
    await updateDoc(doc(db, "lessons", id), data);
  } else {
    data.createdAt = serverTimestamp();
    const ref = doc(collection(db, "lessons"));
    await setDoc(ref, data);
    return ref.id;
  }
}

export async function deleteLesson(id: string) {
  await deleteDoc(doc(db, "lessons", id));
}

export async function incrementLessonView(lessonId: string, userId: string) {
  const ref = doc(db, "lessons", lessonId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    const viewers = data.viewers || {};
    viewers[userId] = (viewers[userId] || 0) + 1;
    await updateDoc(ref, { viewers });
  }
}

export async function activateLessonWithCode(lessonId: string, code: string, userId: string) {
  const lessonRef = doc(db, "lessons", lessonId);
  const lessonSnap = await getDoc(lessonRef);
  if (!lessonSnap.exists()) throw new Error("Lesson not found");
  const lesson = lessonSnap.data() as Lesson;
  const codes = lesson.codes || [];
  if (codes.length === 0) throw new Error("No activation code needed");
  const match = codes.find(c => c.toLowerCase().trim() === code.toLowerCase().trim());
  if (!match) throw new Error("Invalid code");
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const activated: string[] = userSnap.data()?.activatedLessons || [];
  if (activated.includes(lessonId)) throw new Error("Already activated");
  activated.push(lessonId);
  await updateDoc(userRef, { activatedLessons: activated });
  return true;
}

// === Exams ===
export async function fetchExams() {
  const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const list: Exam[] = [];
  for (const d of snap.docs) {
    const dta = d.data() as Exam;
    const courseSnap = await getDoc(doc(db, "courses", dta.courseId || "none"));
    list.push({ ...dta, id: d.id, courseName: courseSnap.exists() ? courseSnap.data().name : "" });
  }
  return list;
}

export async function saveExam(id: string | null, data: any) {
  if (id) {
    await updateDoc(doc(db, "exams", id), data);
  } else {
    data.createdAt = serverTimestamp();
    const ref = doc(collection(db, "exams"));
    await setDoc(ref, data);
    return ref.id;
  }
}

export async function deleteExam(id: string) {
  await deleteDoc(doc(db, "exams", id));
}

export async function submitExamResult(data: Omit<ExamResult, "id">) {
  data.submittedAt = serverTimestamp() as any;
  const ref = doc(collection(db, "exam-results"));
  await setDoc(ref, data);
}

export async function fetchExamResults(studentId?: string) {
  let q: any;
  if (studentId) {
    q = query(collection(db, "exam-results"), where("studentId", "==", studentId));
  } else {
    q = query(collection(db, "exam-results"), orderBy("submittedAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as ExamResult));
}

// === Homework ===
export async function fetchHomework() {
  const q = query(collection(db, "homework"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const list: Homework[] = [];
  for (const d of snap.docs) {
    const dta = d.data() as Homework;
    const courseSnap = await getDoc(doc(db, "courses", dta.courseId || "none"));
    list.push({ ...dta, id: d.id, courseName: courseSnap.exists() ? courseSnap.data().name : "" });
  }
  return list;
}

export async function saveHomework(id: string | null, data: any) {
  if (id) {
    await updateDoc(doc(db, "homework", id), data);
  } else {
    data.createdAt = serverTimestamp();
    const ref = doc(collection(db, "homework"));
    await setDoc(ref, data);
    return ref.id;
  }
}

export async function deleteHomework(id: string) {
  await deleteDoc(doc(db, "homework", id));
}

export async function submitHomework(data: Partial<HomeworkSubmission>) {
  data.submittedAt = serverTimestamp() as any;
  const ref = doc(collection(db, "homework-submissions"));
  await setDoc(ref, data);
}

export async function fetchSubmissions(homeworkId?: string) {
  let q: any;
  if (homeworkId) {
    q = query(collection(db, "homework-submissions"), where("homeworkId", "==", homeworkId));
  } else {
    q = query(collection(db, "homework-submissions"), orderBy("submittedAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as HomeworkSubmission));
}

export async function gradeSubmission(id: string, grade: number, annotation: string, reward: number) {
  await updateDoc(doc(db, "homework-submissions", id), { grade, annotation, reward, gradedAt: serverTimestamp() });
}

// === Files ===
export async function fetchFiles() {
  const q = query(collection(db, "files"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as AppFile));
}

export async function saveFile(data: Partial<AppFile>) {
  data.createdAt = serverTimestamp() as any;
  const ref = doc(collection(db, "files"));
  await setDoc(ref, data);
}

export async function deleteFile(id: string, publicId?: string) {
  await deleteDoc(doc(db, "files", id));
  if (publicId) {
    try {
      const res = await fetch("/api/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, resourceType: "auto" }),
      });
      if (!res.ok) console.error("Failed to delete from Cloudinary");
    } catch (e) { console.error(e); }
  }
}

export async function uploadFile(file: File, folder: string): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return { url: data.url, publicId: data.publicId };
}

// === Wallet ===
export async function fetchTransactions(studentId?: string) {
  let q: any;
  if (studentId) {
    q = query(collection(db, "wallet-transactions"), where("studentId", "==", studentId));
  } else {
    q = query(collection(db, "wallet-transactions"), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as WalletTransaction));
}

export async function addTransaction(studentId: string, type: "credit" | "debit", amount: number, description: string) {
  const ref = doc(collection(db, "wallet-transactions"));
  await setDoc(ref, { studentId, type, amount, description, createdAt: serverTimestamp() });
  const userRef = doc(db, "users", studentId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const current = userSnap.data().wallet || 0;
    await updateDoc(userRef, { wallet: type === "credit" ? current + amount : Math.max(0, current - amount) });
  }
}

export async function fetchWalletPromos() {
  const snap = await getDocs(collection(db, "wallet-promos"));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as WalletPromo));
}

export async function createWalletPromo(code: string, amount: number, maxUses: number, expiresAt: any) {
  const ref = doc(collection(db, "wallet-promos"));
  await setDoc(ref, { code: code.toUpperCase(), amount, maxUses, usedBy: [], expiresAt, createdAt: serverTimestamp() });
  return ref.id;
}

export async function validateWalletPromo(code: string, studentId: string) {
  const q = query(collection(db, "wallet-promos"), where("code", "==", code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return { valid: false, message: "Invalid code" };
  const promo = { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as WalletPromo;
  if ((promo.usedBy || []).includes(studentId)) return { valid: false, message: "Code already used" };
  if (promo.expiresAt && new Date(promo.expiresAt.toDate()) < new Date()) return { valid: false, message: "Code expired" };
  if ((promo.usedBy || []).length >= promo.maxUses) return { valid: false, message: "Code max uses reached" };
  await addTransaction(studentId, "credit", promo.amount, `Wallet promo: ${promo.code}`);
  await updateDoc(doc(db, "wallet-promos", promo.id), { usedBy: [...(promo.usedBy || []), studentId] });
  return { valid: true, amount: promo.amount, message: `${promo.amount} EGP credited to your wallet` };
}

export async function deleteWalletPromo(id: string) {
  await deleteDoc(doc(db, "wallet-promos", id));
}

// === Leaderboard ===
export async function fetchLeaderboard() {
  const snap = await getDocs(collection(db, "users"));
  const list = snap.docs.map(d => ({ id: d.id, name: d.data().name, wallet: d.data().wallet || 0 } as any));
  return list.filter((u: any) => u.name).sort((a: any, b: any) => b.wallet - a.wallet).slice(0, 50);
}

// === Reports ===
export async function fetchReports(studentId?: string) {
  let q: any;
  if (studentId) {
    q = query(collection(db, "reports"), where("studentId", "==", studentId));
  } else {
    q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Report));
}

export async function saveReport(data: Partial<Report>) {
  data.createdAt = serverTimestamp() as any;
  const ref = doc(collection(db, "reports"));
  await setDoc(ref, data);
}

// === Notifications ===
export async function fetchNotifications() {
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Notification));
}

export async function sendNotification(data: Partial<Notification>) {
  data.createdAt = serverTimestamp() as any;
  const ref = doc(collection(db, "notifications"));
  await setDoc(ref, data);
}

export async function deleteNotification(id: string) {
  await deleteDoc(doc(db, "notifications", id));
}

// === Chat ===
export async function fetchMessages(channelId: string) {
  const q = query(collection(db, "chat-messages"), where("channelId", "==", channelId));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as ChatMessage));
  return list.sort((a, b) => ((a.createdAt as any)?.toDate?.() || 0) - ((b.createdAt as any)?.toDate?.() || 0)).slice(-100);
}

export async function sendMessage(data: Partial<ChatMessage>) {
  data.createdAt = serverTimestamp() as any;
  const ref = doc(collection(db, "chat-messages"));
  await setDoc(ref, data);
}
