export type UserRole = "student" | "teacher" | "admin";
export type UserStatus = "pending" | "active" | "banned";
export type QuestionType = "mcq" | "tf" | "short";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  photoURL?: string;
  school?: string;
  department?: string;
  governorate?: string;
  parentName?: string;
  parentPhone?: string;
  wallet: number;
  streak: number;
  badges: string[];
  points: number;
  createdAt: any;
}

export interface Lesson {
  id: string;
  title: string;
  courseId: string;
  courseName?: string;
  videoUrl: string;
  embedCode?: string;
  pdfUrl: string;
  content: string;
  order: number;
  price: number;
  lessonType: "video" | "text";
  codes: string[];
  viewLimit: number;
  viewers: { [uid: string]: number };
  createdAt: any;
}

export interface Course {
  id: string;
  name: string;
  grade: string;
  description: string;
  courseType: "video" | "lessons";
  videoUrl?: string;
  embedCode?: string;
  createdAt: any;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseName?: string;
  duration: number;
  passScore: number;
  questions: ExamQuestion[];
  createdAt: any;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  total: number;
  passed: boolean;
  answers: { questionId: string; answer: string; correct: boolean }[];
  submittedAt: any;
}

export interface Homework {
  id: string;
  title: string;
  courseId: string;
  courseName?: string;
  dueDate: string;
  questions: string;
  createdAt: any;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  files: string[];
  grade?: number;
  annotation?: string;
  reward?: number;
  submittedAt: any;
  gradedAt?: any;
}

export interface AppFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  isPublic: boolean;
  lessonId?: string;
  createdAt: any;
}

export interface WalletTransaction {
  id: string;
  studentId: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: any;
}

export interface Report {
  id: string;
  studentId: string;
  studentName?: string;
  month: string;
  attendance: number;
  grades: string;
  notes: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  forStudents: boolean;
  createdAt: any;
}

export interface GameScore {
  id: string;
  studentId: string;
  gameType: string;
  score: number;
  playedAt: any;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export const BADGES = [
  { id: "atom", icon: "⚛️", nameEn: "Atom", nameAr: "ذرة", descEn: "Complete 10 lessons", descAr: "أكمل 10 دروس" },
  { id: "dna", icon: "🧬", nameEn: "DNA", nameAr: "DNA", descEn: "Score 100% on an exam", descAr: "احصل على 100% في امتحان" },
  { id: "star", icon: "⭐", nameEn: "Star Student", nameAr: "طالب نجم", descEn: "Top of the leaderboard", descAr: "الأول في الترتيب" },
  { id: "chat", icon: "💬", nameEn: "Chatter", nameAr: "ثرثار", descEn: "Send 50 messages", descAr: "أرسل 50 رسالة" },
  { id: "pencil", icon: "📝", nameEn: "Homework Hero", nameAr: "بطل الواجبات", descEn: "Complete 20 homework", descAr: "أكمل 20 واجب" },
  { id: "wallet", icon: "💰", nameEn: "Saver", nameAr: "مدخر", descEn: "Save 1000 points", descAr: "ادخر 1000 نقطة" },
  { id: "game", icon: "🎮", nameEn: "Gamer", nameAr: "لاعب", descEn: "Win 5 daily games", descAr: "اربح 5 ألعاب يومية" },
  { id: "fire", icon: "🔥", nameEn: "On Fire", nameAr: "مشتعل", descEn: "7-day streak", descAr: "7 أيام متتالية" },
];

export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  const m = url.match(/[?&]v=([^&]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  const short = url.match(/youtu\.be\/([^?]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  if (url.includes("youtube.com/embed/")) return url;
  return url;
}
