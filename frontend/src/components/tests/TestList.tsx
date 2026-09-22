import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  FileQuestion,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

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
}: Props) => {
  const isPublished = status === "published";
  const formattedDate = new Date(examDate).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="
        group relative h-full flex flex-col
        rounded-3xl overflow-hidden
        border border-gray-200 dark:border-white/10
        bg-white/70 dark:bg-white/[0.04]
        backdrop-blur-sm
        transition-all duration-500
        hover:-translate-y-2
        hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10
        hover:border-[var(--griffin-gold)]/40
      "
    >
      {/* 🔹 خط طلایی بالای کارت */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 🔹 گرادیان تزئینی گوشه */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative p-5 flex-1 flex flex-col">
        {/* ==================== هدر ==================== */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* درس */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20">
            <BookOpen size={12} className="text-[var(--griffin-gold)]" />
            <span className="text-[11px] font-black text-[var(--griffin-gold)]">
              {lesson}
            </span>
          </div>

          {/* وضعیت */}
          <div
            className={`
              inline-flex items-center gap-1.5
              px-2.5 py-1 rounded-lg
              text-[10px] font-black
              ${
                isPublished
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }
            `}
          >
            <span
              className={`
                w-1.5 h-1.5 rounded-full
                ${isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}
              `}
            />
            {isPublished ? "منتشر شده" : "در انتظار"}
          </div>
        </div>

        {/* ==================== عنوان ==================== */}
        <div className="mb-5">
          <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white leading-7 line-clamp-2 group-hover:text-[var(--griffin-gold)] transition-colors duration-300">
            {title}
          </h3>

          {/* خط جداکننده */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-[var(--griffin-gold)] to-transparent rounded-full" />
            <Sparkles size={10} className="text-[var(--griffin-gold)]/60" />
            <div className="flex-1 h-px bg-gradient-to-l from-[var(--griffin-gold)]/20 to-transparent" />
          </div>
        </div>

        {/* ==================== اطلاعات ==================== */}
        <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
          {/* پایه */}
          <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] p-2.5 group-hover:border-[var(--griffin-gold)]/20 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={11} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                پایه
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {grade}
            </p>
          </div>

          {/* رشته */}
          <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] p-2.5 group-hover:border-[var(--griffin-gold)]/20 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Users size={11} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                رشته
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {major}
            </p>
          </div>

          {/* سؤال */}
          <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] p-2.5 group-hover:border-[var(--griffin-gold)]/20 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <FileQuestion size={11} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                سؤال
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {questionCount.toLocaleString("fa-IR")} سؤال
            </p>
          </div>

          {/* زمان */}
          <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] p-2.5 group-hover:border-[var(--griffin-gold)]/20 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Clock3 size={11} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                زمان
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {duration.toLocaleString("fa-IR")} دقیقه
            </p>
          </div>

          {/* تاریخ (کامل عرض) */}
          <div className="col-span-2 rounded-xl border border-gray-200/70 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] p-2.5 flex items-center justify-between gap-2 group-hover:border-[var(--griffin-gold)]/20 transition-colors">
            <div className="flex items-center gap-2">
              <CalendarDays size={11} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                تاریخ برگزاری
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* ==================== دکمه ==================== */}
        <Link
          to={`/tests/${id}`}
          className="
            group/btn relative
            w-full inline-flex items-center justify-center gap-2
            rounded-xl
            bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
            py-3
            font-heading font-black text-white
            text-sm
            shadow-lg shadow-[var(--griffin-gold)]/30
            hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50
            transition-all duration-300
            overflow-hidden
          "
        >
          <span className="relative z-10 flex items-center gap-2">
            <Trophy size={14} />
            شروع آزمون
            <ArrowLeft
              size={14}
              className="transition-transform group-hover/btn:-translate-x-1"
            />
          </span>
          <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
        </Link>
      </div>
    </div>
  );
};

export default TestCard;
