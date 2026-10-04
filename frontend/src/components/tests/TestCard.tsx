import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  FileQuestion,
  Gift,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ExamAccessType } from "../../api/examApi";

interface Props {
  id: string;
  title: string;
  lesson: string;
  grade: string;
  major: string;
  duration: number;
  questionCount: number;
  status: string;
  examDate: string;
  accessType?: ExamAccessType; // 🆕
}

const TestCard = ({
  id,
  title,
  lesson,
  grade,
  major,
  duration,
  questionCount,
  status,
  examDate,
  accessType, // 🆕
}: Props) => {
  const isPublished = status === "published";
  const isFree = accessType === "FREE"; // 🆕
  const formattedDate = new Date(examDate).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      to={`/tests/${id}`}
      className="
        group relative block w-full
        rounded-2xl overflow-hidden
        border border-gray-200 dark:border-white/10
        bg-white/70 dark:bg-white/[0.04]
        backdrop-blur-sm
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-xl hover:shadow-[var(--griffin-gold)]/10
        hover:border-[var(--griffin-gold)]/40
      "
    >
      {/* خط طلایی راست */}
      <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-[var(--griffin-gold)] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
        {/* ==================== آیکون درس ==================== */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
          <div
            className={`
              relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl
              flex items-center justify-center text-white shadow-lg
              rotate-2 group-hover:rotate-3 transition-transform
              ${
                isFree
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                  : "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700"
              }
            `}
          >
            {isFree ? (
              <Gift size={20} strokeWidth={2.3} />
            ) : (
              <BookOpen size={20} strokeWidth={2.3} />
            )}
          </div>
        </div>

        {/* ==================== اطلاعات اصلی ==================== */}
        <div className="min-w-0 flex-1">
          {/* ردیف ۱: عنوان + وضعیت + رایگان */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-heading text-sm sm:text-base font-black text-gray-900 dark:text-white truncate group-hover:text-[var(--griffin-gold)] transition-colors">
              {title}
            </h3>

            <span
              className={`
                shrink-0 inline-flex items-center gap-1.5
                px-2 py-0.5 rounded-md
                text-[9px] font-black
                ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }
              `}
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isPublished ? "منتشر شده" : "در انتظار"}
            </span>

            {/* 🆕 رایگان */}
            {isFree && (
              <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-l from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/30">
                <Gift size={9} />
                رایگان
              </span>
            )}
          </div>

          {/* ردیف ۲: درس + پایه + رشته */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={10} className="text-[var(--griffin-gold)]" />
              <span className="font-bold">{lesson}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={10} />
              {grade}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen size={10} />
              {major}
            </span>
          </div>
        </div>

        {/* ==================== آمار (دسکتاپ) ==================== */}
        <div className="hidden md:flex items-center gap-4 shrink-0 px-4 border-r border-l border-gray-200 dark:border-white/5">
          <div className="text-center">
            <div className="flex items-center gap-1 mb-0.5 justify-center">
              <FileQuestion size={10} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                سوال
              </span>
            </div>
            <p className="font-heading text-sm font-black text-gray-900 dark:text-white tabular-nums">
              {questionCount.toLocaleString("fa-IR")}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1 mb-0.5 justify-center">
              <Clock3 size={10} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                دقیقه
              </span>
            </div>
            <p className="font-heading text-sm font-black text-gray-900 dark:text-white tabular-nums">
              {duration.toLocaleString("fa-IR")}
            </p>
          </div>
        </div>

        {/* ==================== آمار (موبایل) ==================== */}
        <div className="md:hidden shrink-0 flex flex-col items-end gap-1 text-[10px] font-black text-gray-500 dark:text-gray-400">
          <span className="tabular-nums">
            {questionCount.toLocaleString("fa-IR")} س
          </span>
          <span className="tabular-nums">
            {duration.toLocaleString("fa-IR")} د
          </span>
        </div>

        {/* ==================== تاریخ ==================== */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-gray-500 dark:text-gray-400">
          <CalendarDays size={12} className="text-[var(--griffin-gold)]" />
          {formattedDate}
        </div>

        {/* ==================== فلش ==================== */}
        <div
          className={`
            shrink-0 w-8 h-8 rounded-lg
            flex items-center justify-center
            transition-all
            ${
              isFree
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
                : "bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 text-[var(--griffin-gold)] group-hover:bg-[var(--griffin-gold)] group-hover:text-white"
            }
          `}
        >
          <ArrowLeft size={14} className="rotate-180" />
        </div>
      </div>
    </Link>
  );
};

export default TestCard;
