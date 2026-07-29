"use client";

import { useState, useEffect, FormEvent, useRef, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  IoSchool, IoBook, IoTime, IoGrid, IoStatsChart, IoRibbon, IoCreate,
  IoNotifications, IoCalendar, IoPerson, IoLogOut, IoMenu, IoWarning,
  IoCheckmarkCircle, IoStar, IoWallet, IoGameController, IoChatbubbles,
  IoTrophy, IoDocuments, IoPeople, IoHappy, IoFlash, IoLockClosed,
  IoArrowBack, IoAdd, IoClose, IoCloudUpload, IoTrash, IoPlay,
  IoCheckmark, IoReload, IoPencil, IoEyeOff, IoEye
} from "react-icons/io5";
import { FaFileAlt, FaUserGraduate, FaRobot, FaTrophy, FaGamepad, FaWhatsapp } from "react-icons/fa";
import { getTranslation } from "@/lib/i18n";
import {
  fetchLessons, fetchExams, fetchHomework, fetchFiles, fetchTransactions,
  fetchReports, fetchExamResults, submitExamResult, submitHomework,
  uploadFile, incrementLessonView, updateUserProfile, saveGameScore,
  fetchMessages, sendMessage, fetchLeaderboard, fetchCourses
} from "@/lib/firestore-utils";
import { BADGES, getYouTubeEmbedUrl } from "@/lib/types";
import type { Lesson, Exam, ExamQuestion, Homework, AppFile, WalletTransaction, Report, ExamResult, ChatMessage } from "@/lib/types";

type STab = "home" | "lessons" | "wallet" | "exams" | "homework" | "files" | "reports" | "achievements" | "profile" | "parent" | "ai" | "game";

interface HomeTabProps { lang: string; lessons: Lesson[]; examResults: ExamResult[]; exams: Exam[]; wallet: number; badges: string[]; userId?: string; points: number; completedExams: number; }
interface LessonsTabProps { lang: string; lessons: Lesson[]; userId?: string; }
interface WalletTabProps { lang: string; wallet: number; transactions: WalletTransaction[]; }
interface ExamsTabProps { lang: string; exams: Exam[]; examResults: ExamResult[]; userId?: string; setActiveExam: (e: Exam | null) => void; examAnswers: Record<string, string>; setExamAnswers: (v: Record<string, string>) => void; examSubmitted: boolean; setExamSubmitted: (v: boolean) => void; examScore: number; setExamScore: (v: number) => void; examTimer: number; setExamTimer: (v: number) => void; }
interface ExamPlayerProps { lang: string; activeExam: Exam; examAnswers: Record<string, string>; setExamAnswers: (v: Record<string, string>) => void; examSubmitted: boolean; setExamSubmitted: (v: boolean) => void; examScore: number; setExamScore: (v: number) => void; examTimer: number; setActiveExam: (v: Exam | null) => void; userId?: string; userName?: string; submitExamResult: (data: any) => Promise<void>; }
interface HomeworkTabProps { lang: string; homework: Homework[]; selectedHomework: string | null; setSelectedHomework: (v: string | null) => void; homeworkFiles: File[]; setHomeworkFiles: (v: File[]) => void; userId?: string; uploadFile: (file: File, path: string) => Promise<string>; submitHomeworkFn: (data: any) => Promise<void>; }
interface FilesTabProps { lang: string; files: AppFile[]; lessons: Lesson[]; userId?: string; }
interface ReportsTabProps { lang: string; reports: Report[]; }
interface AchievementsTabProps { lang: string; badges: string[]; }
interface ProfileTabProps { lang: string; profileForm: any; setProfileForm: (v: any) => void; userId?: string; updateUserProfile: (id: string, data: any) => Promise<void>; wallet: number; points: number; badges: string[]; streak: number; }
interface ParentTabProps { lang: string; parentName: string; parentPhone: string; }
interface AITabProps { lang: string; aiChat: { role: string; text: string }[]; aiInput: string; setAiInput: (v: string) => void; setAiChat: (v: { role: string; text: string }[]) => void; }
interface GameTabProps { lang: string; streak: number; points: number; userId?: string; saveGameScore: (data: any) => Promise<void>; setPoints: (v: number) => void; gameType: string | null; setGameType: (v: string | null) => void; gameScore: number; setGameScore: (v: number) => void; gameActive: boolean; setGameActive: (v: boolean) => void; }
interface CommunityModalProps { lang: string; showCommunity: boolean; setShowCommunity: (v: boolean) => void; channelId: string; setChannelId: (v: string) => void; chatText: string; setChatText: (v: string) => void; chatMessages: ChatMessage[]; setChatMessages: (v: ChatMessage[]) => void; userId?: string; userName: string; fetchMessages: (channelId: string) => Promise<ChatMessage[]>; sendMessage: (data: any) => Promise<void>; }
interface LeaderboardModalProps { lang: string; showLeaderboard: boolean; setShowLeaderboard: (v: boolean) => void; leaderboard: any[]; fetchLeaderboard: () => Promise<any[]>; }

const HomeTab = memo(function HomeTab({ lang, lessons, examResults, exams, wallet, badges, userId, points, completedExams }: HomeTabProps) {
  const avgScore = examResults.length > 0 ? Math.round(examResults.reduce((a: number, r: ExamResult) => a + (r.score / r.total) * 100, 0) / examResults.length) : 0;
  const stats = [
    { icon: IoBook, bg: "bg-primary-light", color: "text-primary", value: lessons.filter(l => userId ? l.viewers?.[userId] : false).length.toString(), label: lang === "ar" ? "الدروس المكتملة" : "Completed Lessons" },
    { icon: IoCreate, bg: "bg-[rgba(79,70,229,0.1)]", color: "text-accent", value: completedExams.toString(), label: lang === "ar" ? "الامتحانات" : "Exams Taken" },
    { icon: IoWallet, bg: "bg-[rgba(245,158,11,0.1)]", color: "text-yellow-600", value: `${wallet}`, label: lang === "ar" ? "المحفظة" : "Wallet" },
    { icon: IoTrophy, bg: "bg-[rgba(59,130,246,0.1)]", color: "text-blue-600", value: `${badges.length}`, label: lang === "ar" ? "الإنجازات" : "Achievements" },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-[20px] p-6 shadow-sm border border-border flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}><s.icon className="text-xl" /></div>
            <div><strong className="text-2xl font-bold block">{s.value}</strong><span className="text-sm text-text-light">{s.label}</span></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
          <h4 className="text-base font-semibold mb-4">{lang === "ar" ? "آخر الدروس" : "Recent Lessons"}</h4>
          {lessons.slice(0, 5).map(l => (
            <div key={l.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-sm">{l.title}</span>
              <span className="text-xs text-primary">{l.courseName || ""}</span>
            </div>
          ))}
          {lessons.length === 0 && <p className="text-sm text-text-light">{lang === "ar" ? "لا توجد دروس" : "No lessons"}</p>}
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
          <h4 className="text-base font-semibold mb-4">{lang === "ar" ? "آخر الامتحانات" : "Recent Exams"}</h4>
          {examResults.slice(0, 5).map(r => {
            const exam = exams.find(e => e.id === r.examId);
            return (
              <div key={r.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <span className="text-sm">{exam?.title || r.examId}</span>
                <span className={`text-xs font-semibold ${r.passed ? "text-green-600" : "text-red-600"}`}>{r.score}/{r.total}</span>
              </div>
            );
          })}
          {examResults.length === 0 && <p className="text-sm text-text-light">{lang === "ar" ? "لا توجد نتائج" : "No results"}</p>}
        </div>
      </div>
    </div>
  );
});

const LessonsTab = memo(function LessonsTab({ lang, lessons, userId }: LessonsTabProps) {
  const [playing, setPlaying] = useState<Lesson | null>(null);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "الدروس" : "Lessons"}</h3>
      {playing ? (
        <div>
          <button onClick={() => setPlaying(null)} className="flex items-center gap-2 text-sm text-primary mb-4 cursor-pointer bg-transparent border-none"><IoArrowBack /> {lang === "ar" ? "عودة" : "Back"}</button>
          <h4 className="text-xl font-bold mb-3">{playing.title}</h4>
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{playing.lessonType === "video" ? (lang === "ar" ? "فيديو" : "Video") : (lang === "ar" ? "نصي" : "Text")}</span>
            {playing.price > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{playing.price} {lang === "ar" ? "ج.م" : "EGP"}</span>}
          </div>
          {playing.videoUrl && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
              <iframe src={getYouTubeEmbedUrl(playing.videoUrl)} className="w-full h-full" allowFullScreen />
            </div>
          )}
          {playing.embedCode && <div className="mb-4" dangerouslySetInnerHTML={{ __html: playing.embedCode }} />}
          <div className="prose max-w-none text-sm mb-4" dangerouslySetInnerHTML={{ __html: playing.content }} />
          {playing.pdfUrl && <a href={playing.pdfUrl} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-xl text-sm font-medium">{lang === "ar" ? "تحميل PDF" : "Download PDF"}</a>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map(l => (
            <div key={l.id} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className="h-[120px] bg-gradient-to-br from-[rgba(0,191,166,0.15)] to-[rgba(79,70,229,0.1)] flex items-center justify-center">
                <IoPlay className="text-3xl text-primary/50" />
              </div>
              <div className="p-4">
                <span className="text-xs text-primary bg-primary-light px-2 py-0.5 rounded-full">{l.courseName}</span>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{l.lessonType === "video" ? (lang === "ar" ? "فيديو" : "Video") : (lang === "ar" ? "نصي" : "Text")}</span>
                  {l.price > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{l.price} {lang === "ar" ? "ج.م" : "EGP"}</span>}
                </div>
                <h4 className="font-semibold mt-2 text-sm">{l.title}</h4>
                <p className="text-xs text-text-light mt-1">{lang === "ar" ? `المشاهدات: ${userId ? l.viewers?.[userId] || 0 : 0}` : `Views: ${userId ? l.viewers?.[userId] || 0 : 0}`}</p>
                <button onClick={async () => { await incrementLessonView(l.id, userId!); setPlaying(l); }} className="mt-3 w-full px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "مشاهدة" : "Watch"}</button>
              </div>
            </div>
          ))}
          {lessons.length === 0 && <div className="col-span-full text-center py-12 text-text-light">{lang === "ar" ? "لا توجد دروس متاحة" : "No lessons available"}</div>}
        </div>
      )}
    </div>
  );
});

const WalletTabComp = memo(function WalletTabComp({ lang, wallet, transactions }: WalletTabProps) {
  return (
    <div>
      <div className="bg-gradient-to-r from-primary to-accent rounded-[20px] p-6 text-white mb-6">
        <p className="text-sm opacity-80">{lang === "ar" ? "رصيد المحفظة" : "Wallet Balance"}</p>
        <p className="text-3xl font-bold">{wallet} {lang === "ar" ? "نقطة" : "pts"}</p>
      </div>
      <h4 className="text-base font-semibold mb-4">{lang === "ar" ? "سجل المعاملات" : "Transaction History"}</h4>
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
        {transactions.length === 0 ? <p className="text-sm text-text-light">{lang === "ar" ? "لا توجد معاملات" : "No transactions"}</p> :
          transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
              <div>
                <span className="text-sm font-medium">{tx.description}</span>
                <p className="text-xs text-text-light">{new Date(tx.createdAt?.toDate()).toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                {tx.type === "credit" ? "+" : "-"}{tx.amount}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
});

const ExamsTabComp = memo(function ExamsTabComp({ lang, exams, examResults, userId, setActiveExam, examAnswers, setExamAnswers, examSubmitted, setExamSubmitted, examScore, setExamScore, setExamTimer }: ExamsTabProps) {
  const [examList, setExamList] = useState<Exam[]>(exams);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "الامتحانات" : "Exams"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {examList.map(e => {
          const done = examResults.find(r => r.examId === e.id);
          return (
            <div key={e.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
              <h4 className="font-semibold">{e.title}</h4>
              <p className="text-xs text-text-light mt-1">{e.courseName} • {e.questions?.length || 0} {lang === "ar" ? "سؤال" : "questions"} • {e.duration || 0}{lang === "ar" ? "د" : "min"}</p>
              {done ? (
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-sm font-semibold ${done.passed ? "text-green-600" : "text-red-600"}`}>{done.score}/{done.total}</span>
                  {done.passed ? <IoCheckmarkCircle className="text-green-600" /> : <IoClose className="text-red-600" />}
                </div>
              ) : (
                <button onClick={() => { setActiveExam(e); setExamAnswers({}); setExamSubmitted(false); setExamScore(0); setExamTimer((e.duration || 10) * 60); }} className="mt-3 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">
                  {lang === "ar" ? "بدء الامتحان" : "Start Exam"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

const ExamPlayerComp = memo(function ExamPlayerComp({ lang, activeExam, examAnswers, setExamAnswers, examSubmitted, setExamSubmitted, examScore, setExamScore, examTimer, setActiveExam, userId, userName, submitExamResult }: ExamPlayerProps) {
  const submitExam = useCallback(() => {
    let score = 0;
    const answers = activeExam.questions.map(q => {
      const userAns = examAnswers[q.id] || "";
      const correct = userAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      if (correct) score += q.points || 1;
      return { questionId: q.id, answer: userAns, correct };
    });
    const total = activeExam.questions.reduce((a: number, q: ExamQuestion) => a + (q.points || 1), 0);
    const passed = score / total >= (activeExam.passScore || 50) / 100;
    setExamScore(score);
    setExamSubmitted(true);
    submitExamResult({ examId: activeExam.id, studentId: userId, score, total, passed, answers, submittedAt: new Date() as any });
  }, [activeExam, examAnswers, setExamAnswers, setExamSubmitted, setExamScore, submitExamResult, userId]);

  if (examSubmitted) {
    const total = activeExam.questions.reduce((a: number, q: ExamQuestion) => a + (q.points || 1), 0);
    return (
      <div className="text-center py-12">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${examScore / total >= (activeExam.passScore || 50) / 100 ? "bg-green-100" : "bg-red-100"}`}>
          {examScore / total >= (activeExam.passScore || 50) / 100 ? <IoCheckmarkCircle className="text-3xl text-green-600" /> : <IoClose className="text-3xl text-red-600" />}
        </div>
        <h3 className="text-2xl font-bold mb-2">{lang === "ar" ? "النتيجة" : "Result"}</h3>
        <p className="text-4xl font-bold text-primary">{examScore}/{total}</p>
        <p className="text-text-light mt-2">{Math.round((examScore / total) * 100)}%</p>
        {examScore / total >= (activeExam.passScore || 50) / 100 && <button onClick={() => { const studentName = userName || "Student"; }} className="mt-4 px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white cursor-pointer border-none">{lang === "ar" ? "تحميل الشهادة" : "Download Certificate"}</button>}
        <button onClick={() => setActiveExam(null)} className="mt-6 px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "عودة" : "Back"}</button>
      </div>
    );
  }

  const minutes = Math.floor(examTimer / 60);
  const seconds = examTimer % 60;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { setActiveExam(null); }} className="flex items-center gap-2 text-sm text-primary cursor-pointer bg-transparent border-none"><IoArrowBack /> {lang === "ar" ? "خروج" : "Exit"}</button>
        <div className={`text-lg font-bold ${examTimer < 120 ? "text-red-600 animate-pulse" : "text-text"}`}>{minutes}:{seconds.toString().padStart(2, "0")}</div>
      </div>
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border">
        <h3 className="text-xl font-bold mb-2">{activeExam.title}</h3>
        {activeExam.questions.map((q: ExamQuestion, i: number) => (
          <div key={q.id} className="mb-6 pb-4 border-b border-border last:border-b-0">
            <p className="font-medium mb-3">{i + 1}. {q.question} <span className="text-xs text-text-light">({q.points || 1} {lang === "ar" ? "نقطة" : "pts"})</span></p>
            {q.type === "mcq" && q.options?.map((opt: string) => (
              <label key={opt} className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg cursor-pointer mb-2">
                <input type="radio" name={q.id} value={opt} checked={examAnswers[q.id] === opt} onChange={e => setExamAnswers({ ...examAnswers, [q.id]: e.target.value })} className="accent-primary" />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
            {q.type === "tf" && (
              <div className="flex gap-4">
                {["True", "False"].map(opt => (
                  <label key={opt} className="flex items-center gap-2 p-3 rounded-xl hover:bg-bg cursor-pointer">
                    <input type="radio" name={q.id} value={opt} checked={examAnswers[q.id] === opt} onChange={e => setExamAnswers({ ...examAnswers, [q.id]: e.target.value })} className="accent-primary" />
                    <span className="text-sm">{opt === "True" ? (lang === "ar" ? "صواب" : "True") : (lang === "ar" ? "خطأ" : "False")}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === "short" && (
              <input value={examAnswers[q.id] || ""} onChange={e => setExamAnswers({ ...examAnswers, [q.id]: e.target.value })} placeholder={lang === "ar" ? "اكتب إجابتك" : "Type your answer"} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
            )}
          </div>
        ))}
        <button onClick={submitExam} className="w-full px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "تسليم الامتحان" : "Submit Exam"}</button>
      </div>
    </div>
  );
});

const HomeworkTabComp = memo(function HomeworkTabComp({ lang, homework, selectedHomework, setSelectedHomework, homeworkFiles, setHomeworkFiles, userId, uploadFile, submitHomeworkFn }: HomeworkTabProps) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "الواجبات" : "Homework"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {homework.map(h => {
          const isSelected = selectedHomework === h.id;
          return (
            <div key={h.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
              <h4 className="font-semibold">{h.title}</h4>
              <p className="text-xs text-text-light mt-1">{h.courseName} • {lang === "ar" ? "تسليم: " : "Due: "}{h.dueDate}</p>
              {isSelected && (
                <div className="mt-3 space-y-2">
                  <input type="file" multiple onChange={e => setHomeworkFiles(Array.from(e.target.files || []))} className="text-sm" />
                  <button onClick={async () => {
                    setSubmitting(true);
                    const files = homeworkFiles;
                    for (const file of files) {
                      const url = await uploadFile(file, `homework/${h.id}/${userId}/${file.name}`);
                      await submitHomeworkFn({ homeworkId: h.id, studentId: userId, files: [url] });
                    }
                    setSubmitting(false);
                    setSelectedHomework(null);
                    setHomeworkFiles([]);
                  }} disabled={submitting || homeworkFiles.length === 0} className="w-full px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none disabled:opacity-50">
                    {submitting ? "..." : (lang === "ar" ? "تأكيد التسليم" : "Submit Files")}
                  </button>
                </div>
              )}
              <button onClick={() => setSelectedHomework(isSelected ? null : h.id)} className="mt-3 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">
                {isSelected ? (lang === "ar" ? "إغلاق" : "Close") : (lang === "ar" ? "رفع الحل" : "Submit Solution")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const FilesTabComp = memo(function FilesTabComp({ lang, files, lessons, userId }: FilesTabProps) {
  const publicFiles = files.filter(f => f.isPublic);
  const lockedFiles = files.filter(f => !f.isPublic);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{lang === "ar" ? "الملفات العامة" : "Public Files"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {publicFiles.map(f => (
          <a key={f.id} href={f.url} target="_blank" className="bg-white rounded-[20px] p-4 shadow-sm border border-border flex items-center gap-3 hover:-translate-y-0.5 transition-all">
            <FaFileAlt className="text-primary text-xl" />
            <span className="text-sm font-medium">{f.name}</span>
          </a>
        ))}
        {publicFiles.length === 0 && <p className="text-text-light text-sm col-span-full">{lang === "ar" ? "لا توجد ملفات عامة" : "No public files"}</p>}
      </div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><IoLockClosed /> {lang === "ar" ? "ملفات الدروس" : "Lesson Files"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lockedFiles.map(f => {
          const lesson = lessons.find(l => l.id === f.lessonId);
          const canAccess = userId ? lesson?.viewers?.[userId] : false;
          return canAccess ? (
            <a key={f.id} href={f.url} target="_blank" className="bg-white rounded-[20px] p-4 shadow-sm border border-border flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <FaFileAlt className="text-primary text-xl" />
              <span className="text-sm font-medium">{f.name}</span>
            </a>
          ) : (
            <div key={f.id} className="bg-white rounded-[20px] p-4 shadow-sm border border-border flex items-center gap-3 opacity-50">
              <IoLockClosed className="text-text-light text-xl" />
              <span className="text-sm text-text-light">{f.name} — {lesson?.title || ""}</span>
            </div>
          );
        })}
        {lockedFiles.length === 0 && <p className="text-text-light text-sm col-span-full">{lang === "ar" ? "لا توجد ملفات دروس" : "No lesson files"}</p>}
      </div>
    </div>
  );
});

const ReportsTabComp = memo(function ReportsTabComp({ lang, reports }: ReportsTabProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "التقارير الشهرية" : "Monthly Reports"}</h3>
      <div className="space-y-4">
        {reports.map(r => (
          <div key={r.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-border">
            <h4 className="font-semibold">{r.month}</h4>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div><span className="text-text-light">{lang === "ar" ? "الحضور" : "Attendance"}:</span> <span className="font-medium">{r.attendance}%</span></div>
              <div><span className="text-text-light">{lang === "ar" ? "الدرجات" : "Grades"}:</span> <span className="font-medium">{r.grades}</span></div>
            </div>
            {r.notes && <p className="text-sm text-text-light mt-2">{r.notes}</p>}
          </div>
        ))}
        {reports.length === 0 && <p className="text-text-light">{lang === "ar" ? "لا توجد تقارير بعد" : "No reports yet"}</p>}
      </div>
    </div>
  );
});

const AchievementsTabComp = memo(function AchievementsTabComp({ lang, badges }: AchievementsTabProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{lang === "ar" ? "الإنجازات" : "Achievements"}</h3>
      <p className="text-sm text-text-light mb-5">{lang === "ar" ? `لديك ${badges.length} من ${BADGES.length} شارات` : `You have ${badges.length} of ${BADGES.length} badges`}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {BADGES.map(b => {
          const earned = badges.includes(b.id);
          return (
            <div key={b.id} className={`bg-white rounded-[20px] p-5 shadow-sm border text-center transition-all ${earned ? "border-primary" : "border-border opacity-40"}`}>
              <div className="text-4xl mb-2">{b.icon}</div>
              <h4 className="font-semibold text-sm">{lang === "ar" ? b.nameAr : b.nameEn}</h4>
              <p className="text-xs text-text-light mt-1">{lang === "ar" ? b.descAr : b.descEn}</p>
              {earned && <IoCheckmarkCircle className="text-green-500 mx-auto mt-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
});

const ProfileTabComp = memo(function ProfileTabComp({ lang, profileForm, setProfileForm, userId, updateUserProfile, wallet, points, badges, streak }: ProfileTabProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile(userId!, profileForm);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const exportData = () => {
    const data = JSON.stringify({ ...profileForm, wallet, points, badges, streak }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "profile.json"; a.click();
  };
  const importData = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setProfileForm((prev: any) => ({ ...prev, ...data }));
      } catch { alert("Invalid JSON"); }
    };
    reader.readAsText(file);
  };
  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "الملف الشخصي" : "Profile"}</h3>
      <form onSubmit={handleSave} className="bg-white rounded-[20px] p-6 shadow-sm border border-border space-y-4">
        {[
          { key: "name", label: lang === "ar" ? "الاسم" : "Name" },
          { key: "phone", label: lang === "ar" ? "الهاتف" : "Phone" },
          { key: "school", label: lang === "ar" ? "المدرسة" : "School" },
          { key: "department", label: lang === "ar" ? "الإدارة التعليمية" : "Department" },
          { key: "governorate", label: lang === "ar" ? "المحافظة" : "Governorate" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input value={profileForm[f.key] || ""} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{saving ? "..." : lang === "ar" ? "حفظ" : "Save"}</button>
          <button type="button" onClick={exportData} className="px-6 py-3 rounded-full text-sm font-semibold border border-border bg-white cursor-pointer">{lang === "ar" ? "تصدير" : "Export JSON"}</button>
          <label className="px-6 py-3 rounded-full text-sm font-semibold border border-border bg-white cursor-pointer inline-flex items-center">
            {lang === "ar" ? "استيراد" : "Import JSON"}
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
        {saved && <p className="text-green-600 text-sm">{lang === "ar" ? "تم الحفظ" : "Saved!"}</p>}
      </form>
    </div>
  );
});

const ParentTabComp = memo(function ParentTabComp({ lang, parentName, parentPhone }: ParentTabProps) {
  return (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "بيانات ولي الأمر" : "Parent Information"}</h3>
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-border space-y-4">
        <div>
          <p className="text-sm text-text-light">{lang === "ar" ? "اسم ولي الأمر" : "Parent Name"}</p>
          <p className="font-semibold">{parentName || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-text-light">{lang === "ar" ? "رقم الهاتف" : "Phone Number"}</p>
          <p className="font-semibold">{parentPhone || "—"}</p>
        </div>
        {parentPhone && (
          <a href={`https://wa.me/${parentPhone.replace(/^0/, "2")}`} target="_blank" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium cursor-pointer">
            <FaWhatsapp className="text-lg" /> {lang === "ar" ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
          </a>
        )}
      </div>
    </div>
  );
});

const AITabComp = memo(function AITabComp({ lang, aiChat, aiInput, setAiInput, setAiChat }: AITabProps) {
  const sendAiMessage = useCallback(() => {
    if (!aiInput.trim()) return;
    const newChat = [...aiChat, { role: "user", text: aiInput }];
    setAiChat(newChat);
    setAiInput("");
    setTimeout(() => {
      const responses: Record<string, string> = {
        "hello": "Hello! I'm your AI assistant for the Egyptian English curriculum. How can I help?",
        "السلام": "وعليكم السلام! أنا المساعد الذكي للمنهج المصري. كيف أساعدك؟",
      };
      const reply = responses[aiInput.toLowerCase()] || (lang === "ar" ? "شكراً لسؤالك. يمكنك مراجعة الدروس أو الامتحانات للمزيد من المعلومات." : "Thanks for your question. Check lessons or exams for more info.");
      const newChat = [...aiChat, { role: "ai", text: reply }]; setAiChat(newChat);
    }, 500);
  }, [aiInput, aiChat, setAiInput, setAiChat, lang]);

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-5">{lang === "ar" ? "المساعد الذكي" : "AI Assistant"}</h3>
      <div className="bg-white rounded-[20px] shadow-sm border border-border flex flex-col h-[400px]">
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {aiChat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-bg text-text"}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAiMessage()} placeholder={lang === "ar" ? "اسأل سؤالاً..." : "Ask a question..."} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm" />
          <button onClick={sendAiMessage} className="px-4 py-2.5 rounded-xl bg-primary text-white cursor-pointer border-none">{lang === "ar" ? "إرسال" : "Send"}</button>
        </div>
      </div>
    </div>
  );
});

const GameTabComp = memo(function GameTabComp({ lang, streak, points, userId, saveGameScore, setPoints, gameType, setGameType, gameScore, setGameScore, gameActive, setGameActive }: GameTabProps) {
  const startGame = (type: string) => { setGameType(type); setGameScore(0); setGameActive(true); };
  const endGame = useCallback(async () => {
    setGameActive(false);
    await saveGameScore({ studentId: userId, gameType, score: gameScore });
    const newPoints = points + gameScore;
    const { updateDoc, doc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    await updateDoc(doc(db, "users", userId!), { points: newPoints });
    setPoints(newPoints);
  }, [gameType, gameScore, points, saveGameScore, setPoints, userId]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{lang === "ar" ? "لعبة اليوم" : "Daily Game"}</h3>
      <p className="text-sm text-text-light mb-5">{lang === "ar" ? `🔥 Streak: ${streak} أيام` : `🔥 Streak: ${streak} days`}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { key: "quiz", icon: "🧠", name: lang === "ar" ? "اختبار سريع" : "Quick Quiz" },
          { key: "memory", icon: "🎮", name: lang === "ar" ? "الذاكرة" : "Memory" },
          { key: "word", icon: "📖", name: lang === "ar" ? "كلمة اليوم" : "Word" },
          { key: "math", icon: "🔢", name: lang === "ar" ? "رياضيات" : "Math" },
          { key: "typing", icon: "⌨️", name: lang === "ar" ? "سرعة الكتابة" : "Typing" },
        ].map(g => (
          <div key={g.key} className="bg-white rounded-[20px] p-5 shadow-sm border border-border text-center hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => startGame(g.key)}>
            <div className="text-4xl mb-2">{g.icon}</div>
            <h4 className="font-semibold text-sm">{g.name}</h4>
          </div>
        ))}
      </div>
      {gameActive && (
        <div className="mt-6 bg-white rounded-[20px] p-6 shadow-sm border border-border text-center">
          <p className="text-lg font-semibold mb-3">{lang === "ar" ? `تلعب: ${gameType}` : `Playing: ${gameType}`}</p>
          <p className="text-3xl font-bold text-primary mb-4">{gameScore}</p>
          <button onClick={() => setGameScore(gameScore + 10)} className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white mr-3 cursor-pointer border-none">+10</button>
          <button onClick={endGame} className="px-6 py-3 rounded-full text-sm font-semibold border border-border cursor-pointer bg-white">{lang === "ar" ? "إنهاء" : "End Game"}</button>
        </div>
      )}
    </div>
  );
});

const CommunityModalComp = memo(function CommunityModalComp({ lang, showCommunity, setShowCommunity, channelId, setChannelId, chatText, setChatText, chatMessages, setChatMessages, userId, userName, fetchMessages, sendMessage }: CommunityModalProps) {
  useEffect(() => {
    const load = async () => {
      const msgs = await fetchMessages(channelId);
      setChatMessages(msgs);
    };
    if (showCommunity) load();
  }, [channelId, showCommunity]);
  const send = useCallback(async () => {
    if (!chatText.trim()) return;
    await sendMessage({ channelId, senderId: userId, senderName: userName || "User", text: chatText });
    setChatText("");
    const msgs = await fetchMessages(channelId);
    setChatMessages(msgs);
  }, [channelId, chatText, userId, userName, sendMessage, setChatText]);
  if (!showCommunity) return null;
  const channels = ["general", "english", "homework", "games", "random"];
  const channelNames: Record<string, string> = { general: lang === "ar" ? "عام" : "General", english: "English", homework: lang === "ar" ? "واجبات" : "Homework", games: lang === "ar" ? "ألعاب" : "Games", random: lang === "ar" ? "عشوائي" : "Random" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCommunity(false)}>
      <div className="bg-white rounded-[20px] w-full max-w-lg max-h-[80vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold">{lang === "ar" ? "المجتمع" : "Community"}</h3>
          <button onClick={() => setShowCommunity(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button>
        </div>
        <div className="flex gap-2 px-4 py-2 border-b border-border overflow-x-auto">
          {channels.map(ch => (
            <button key={ch} onClick={() => setChannelId(ch)} className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-none ${channelId === ch ? "bg-primary text-white" : "bg-bg text-text-light"}`}># {channelNames[ch]}</button>
          ))}
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3 h-[300px]">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.senderId === userId ? "bg-primary text-white" : "bg-bg text-text"}`}>
                <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderId === userId ? lang === "ar" ? "أنت" : "You" : msg.senderName}</p>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <input value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={lang === "ar" ? "اكتب رسالة..." : "Type a message..."} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm" />
          <button onClick={send} className="px-4 py-2.5 rounded-xl bg-primary text-white cursor-pointer border-none">{lang === "ar" ? "إرسال" : "Send"}</button>
        </div>
      </div>
    </div>
  );
});

const LeaderboardModalComp = memo(function LeaderboardModalComp({ lang, showLeaderboard, setShowLeaderboard, leaderboard }: LeaderboardModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLeaderboard(false)}>
      <div className="bg-white rounded-[20px] w-full max-w-md max-h-[80vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold">{lang === "ar" ? "البطولة" : "Leaderboard"}</h3>
          <button onClick={() => setShowLeaderboard(false)} className="text-xl cursor-pointer bg-transparent border-none"><IoClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {leaderboard.map((s, i) => (
            <div key={s.id} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-bg text-text-light"}`}>{i + 1}</span>
                <span className="text-sm font-medium">{s.name}</span>
              </div>
              <span className="text-sm font-bold text-primary">{s.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default function StudentDashboard() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, userRole, userStatus, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<STab>("home");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [files, setFiles] = useState<AppFile[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [examTimer, setExamTimer] = useState(0);
  const [homeworkFiles, setHomeworkFiles] = useState<File[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [channelId, setChannelId] = useState("general");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [aiChat, setAiChat] = useState<{ role: string; text: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [profileForm, setProfileForm] = useState<any>({});
  const [loadingData, setLoadingData] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [showCommunity, setShowCommunity] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameType, setGameType] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => { setLang(document.documentElement.lang === "ar" ? "ar" : "en"); }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (userRole && userRole !== "student") router.push("/");
    }
  }, [user, loading, userRole, router]);

  useEffect(() => {
    if (user && userRole === "student") {
      loadData();
      loadUserProfile();
    }
  }, [user, userRole]);

  const loadData = async () => {
    setLoadingData(true);
    const safe = <T,>(p: Promise<T>): Promise<T> => p.catch(e => { console.error(e); return [] as any; });
    const [l, e, h, f, t, r, er, c] = await Promise.all([
      safe(fetchLessons()), safe(fetchExams()), safe(fetchHomework()), safe(fetchFiles()),
      safe(fetchTransactions(user?.uid)), safe(fetchReports(user?.uid)), safe(fetchExamResults(user?.uid)), safe(fetchCourses())
    ]);
    setLessons(l); setExams(e); setHomework(h); setFiles(f);
    setTransactions(t); setReports(r); setExamResults(er); setCourses(c);
    setLoadingData(false);
  };

  const loadUserProfile = async () => {
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    const snap = await getDoc(doc(db, "users", user!.uid));
    if (snap.exists()) {
      const d = snap.data();
      setWallet(d.wallet || 0);
      setPoints(d.points || 0);
      setStreak(d.streak || 0);
      setBadges(d.badges || []);
      setUserName(d.name || "");
      setUserPhone(d.phone || "");
      setParentName(d.parentName || "");
      setParentPhone(d.parentPhone || "");
      setProfileForm({ name: d.name, phone: d.phone, school: d.school || "", department: d.department || "", governorate: d.governorate || "", parentName: d.parentName || "", parentPhone: d.parentPhone || "" });
    }
  };

  useEffect(() => {
    if (activeExam && examTimer > 0 && !examSubmitted) {
      const int = setInterval(() => {
        setExamTimer((prev: number) => { if (prev <= 1) { setExamSubmitted(true); return 0; } return prev - 1; });
      }, 1000);
      return () => clearInterval(int);
    }
  }, [activeExam, examTimer, examSubmitted]);

  function t(key: string) { return getTranslation(lang, key); }
  const completedExams = examResults.length;

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-bg"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (userStatus === "pending" || userStatus === "banned") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 rounded-full ${userStatus === "pending" ? "bg-yellow-100" : "bg-red-100"} flex items-center justify-center mx-auto mb-6`}>
            {userStatus === "pending" ? <IoTime className="text-4xl text-yellow-600" /> : <IoWarning className="text-4xl text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold mb-3">{userStatus === "pending" ? (lang === "ar" ? "بانتظار الموافقة" : "Pending Approval") : (lang === "ar" ? "الحساب محظور" : "Account Suspended")}</h2>
          <p className="text-text-light mb-6">{userStatus === "pending" ? (lang === "ar" ? "حسابك قيد المراجعة من الإدارة." : "Your account is under review.") : (lang === "ar" ? "تم حظر حسابك. تواصل مع الإدارة." : "Your account is suspended. Contact admin.")}</p>
          <button onClick={() => { logout(); router.push("/"); }} className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-primary to-accent text-white cursor-pointer border-none">{lang === "ar" ? "العودة للرئيسية" : "Back to Home"}</button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { key: "home" as STab, icon: IoGrid, label: lang === "ar" ? "الرئيسية" : "Home" },
    { key: "lessons" as STab, icon: IoBook, label: lang === "ar" ? "الدروس" : "Lessons" },
    { key: "wallet" as STab, icon: IoWallet, label: lang === "ar" ? "المحفظة" : "Wallet" },
    { key: "exams" as STab, icon: IoCreate, label: lang === "ar" ? "الامتحانات" : "Exams" },
    { key: "homework" as STab, icon: IoDocuments, label: lang === "ar" ? "الواجبات" : "Homework" },
    { key: "files" as STab, icon: FaFileAlt, label: lang === "ar" ? "الملفات" : "Files" },
    { key: "reports" as STab, icon: IoStatsChart, label: lang === "ar" ? "التقارير" : "Reports" },
    { key: "achievements" as STab, icon: IoTrophy, label: lang === "ar" ? "الإنجازات" : "Achievements" },
    { key: "profile" as STab, icon: IoPerson, label: lang === "ar" ? "الملف الشخصي" : "Profile" },
    { key: "parent" as STab, icon: IoPeople, label: lang === "ar" ? "ولي الأمر" : "Parent" },
    { key: "ai" as STab, icon: FaRobot, label: lang === "ar" ? "المساعد الذكي" : "AI Assistant" },
    { key: "game" as STab, icon: FaGamepad, label: lang === "ar" ? "لعبة اليوم" : "Daily Game" },
  ];

  function renderTab() {
    switch (tab) {
      case "home": return <HomeTab lang={lang} lessons={lessons} examResults={examResults} exams={exams} wallet={wallet} badges={badges} userId={user?.uid} points={points} completedExams={completedExams} />;
      case "lessons": return <LessonsTab lang={lang} lessons={lessons} userId={user?.uid} />;
      case "wallet": return <WalletTabComp lang={lang} wallet={wallet} transactions={transactions} />;
      case "exams": return activeExam ? <ExamPlayerComp lang={lang} activeExam={activeExam} examAnswers={examAnswers} setExamAnswers={setExamAnswers} examSubmitted={examSubmitted} setExamSubmitted={setExamSubmitted} examScore={examScore} setExamScore={setExamScore} examTimer={examTimer} setActiveExam={setActiveExam} userId={user?.uid} userName={userName} submitExamResult={submitExamResult} /> : <ExamsTabComp lang={lang} exams={exams} examResults={examResults} userId={user?.uid} setActiveExam={setActiveExam} examAnswers={examAnswers} setExamAnswers={setExamAnswers} examSubmitted={examSubmitted} setExamSubmitted={setExamSubmitted} examScore={examScore} setExamScore={setExamScore} examTimer={examTimer} setExamTimer={setExamTimer} />;
      case "homework": return <HomeworkTabComp lang={lang} homework={homework} selectedHomework={selectedHomework} setSelectedHomework={setSelectedHomework} homeworkFiles={homeworkFiles} setHomeworkFiles={setHomeworkFiles} userId={user?.uid} uploadFile={uploadFile} submitHomeworkFn={submitHomework} />;
      case "files": return <FilesTabComp lang={lang} files={files} lessons={lessons} userId={user?.uid} />;
      case "reports": return <ReportsTabComp lang={lang} reports={reports} />;
      case "achievements": return <AchievementsTabComp lang={lang} badges={badges} />;
      case "profile": return <ProfileTabComp lang={lang} profileForm={profileForm} setProfileForm={setProfileForm} userId={user?.uid} updateUserProfile={updateUserProfile} wallet={wallet} points={points} badges={badges} streak={streak} />;
      case "parent": return <ParentTabComp lang={lang} parentName={parentName} parentPhone={parentPhone} />;
      case "ai": return <AITabComp lang={lang} aiChat={aiChat} aiInput={aiInput} setAiInput={setAiInput} setAiChat={setAiChat} />;
      case "game": return <GameTabComp lang={lang} streak={streak} points={points} userId={user?.uid} saveGameScore={saveGameScore} setPoints={setPoints} gameType={gameType} setGameType={setGameType} gameScore={gameScore} setGameScore={setGameScore} gameActive={gameActive} setGameActive={setGameActive} />;
      default: return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-bg" dir={lang === "ar" ? "rtl" : "ltr"}>
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-[260px] bg-white border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-5 border-b border-border flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base"><IoSchool className="text-primary" />{lang === "ar" ? "الطالب" : "Student"}</Link>
        </div>
        <nav className="p-3 flex-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <a key={item.key} href="#" onClick={e => { e.preventDefault(); setTab(item.key); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 mb-0.5 cursor-pointer ${tab === item.key ? "bg-gradient-to-r from-primary to-accent text-white" : "text-text-light hover:bg-primary-light hover:text-primary"}`}>
              <item.icon className="text-sm w-5 text-center" /> {item.label}
            </a>
          ))}
          <a href="#" onClick={e => { e.preventDefault(); setShowCommunity(true); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-light hover:bg-primary-light hover:text-primary transition-all duration-300 mb-0.5 cursor-pointer">
            <IoChatbubbles className="text-sm w-5 text-center" /> {lang === "ar" ? "المجتمع" : "Community"}
          </a>
          <a href="#" onClick={e => { e.preventDefault(); setShowLeaderboard(true); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-light hover:bg-primary-light hover:text-primary transition-all duration-300 mb-0.5 cursor-pointer">
            <IoTrophy className="text-sm w-5 text-center" /> {lang === "ar" ? "البطولة" : "Leaderboard"}
          </a>
          <a href="#" onClick={e => { e.preventDefault(); logout(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-light hover:bg-red-50 hover:text-red-500 transition-all duration-300 mt-4 cursor-pointer">
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
            {streak > 0 && <span className="flex items-center gap-1 text-sm text-orange-500">🔥 {streak}</span>}
            <span className="flex items-center gap-1 text-sm text-yellow-600"><IoStar /> {points}</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">{user?.email?.charAt(0).toUpperCase() || "S"}</div>
          </div>
        </div>

        {loadingData ? <div className="text-center py-12"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div> : renderTab()}
      </div>

      <CommunityModalComp lang={lang} showCommunity={showCommunity} setShowCommunity={setShowCommunity} channelId={channelId} setChannelId={setChannelId} chatText={chatText} setChatText={setChatText} chatMessages={chatMessages} setChatMessages={setChatMessages} userId={user?.uid} userName={userName} fetchMessages={fetchMessages} sendMessage={sendMessage} />

      {showLeaderboard && (
        <LeaderboardModalComp lang={lang} showLeaderboard={showLeaderboard} setShowLeaderboard={setShowLeaderboard} leaderboard={leaderboard} fetchLeaderboard={fetchLeaderboard} />
      )}
    </div>
  );
}