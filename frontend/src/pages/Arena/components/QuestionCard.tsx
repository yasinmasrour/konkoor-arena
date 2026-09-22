import { BookOpen, Lightbulb, Sparkles } from "lucide-react";
import MathText from "../../../components/questions/MathText";

interface QuestionCardProps {
  order: number;
  total: number;
  questionText: string;
  questionImage?: string | null;
}

const QuestionCard = ({
  order,
  total,
  questionText,
  questionImage,
}: QuestionCardProps) => {
  const progress = (order / total) * 100;

  return (
    <section className="relative h-full overflow-hidden rounded-2xl border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm flex flex-col">
      {/* 🔹 خط طلایی بالا */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

      {/* 🔹 هاله ملایم گوشه */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl" />

      {/* ==================== هدر (ثابت) ==================== */}
      <div className="relative shrink-0 flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border-b border-white/5">
        {/* برچسب راهنما */}
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 shrink-0">
          <Lightbulb
            size={11}
            className="text-[var(--griffin-gold)] animate-pulse"
          />
          <span className="text-[9px] font-black text-[var(--griffin-gold)] tracking-wide hidden xs:inline">
            سریع بخون
          </span>
          <span className="text-[9px] font-black text-[var(--griffin-gold)] tracking-wide xs:hidden">
            سؤال
          </span>
        </div>

        {/* شمارنده */}
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white shadow-lg shadow-[var(--griffin-gold)]/30 shrink-0">
          <BookOpen size={10} />
          <span className="font-heading text-[10px] font-black tabular-nums">
            {order.toLocaleString("fa-IR")} / {total.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>

      {/* ==================== محتوای قابل اسکرول ==================== */}
      <div className="relative flex-1 min-h-0 overflow-y-auto question-scroll">
        <div className="p-3 sm:p-4 space-y-3">
          {/* تصویر سؤال */}
          {questionImage && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 p-1.5">
              <img
                src={questionImage}
                alt="تصویر سؤال"
                className="max-h-40 sm:max-h-52 w-full rounded-lg object-contain"
              />

              <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--griffin-gold)]/90 text-white text-[8px] font-black backdrop-blur-sm">
                <Sparkles size={8} />
                تصویر
              </div>
            </div>
          )}

          {/* متن سؤال */}
          <div className="text-right font-heading text-base sm:text-lg md:text-xl font-bold leading-7 sm:leading-8 md:leading-9 text-white">
            <MathText content={questionText} />
          </div>
        </div>
      </div>

      {/* ==================== نوار پیشرفت پایین ==================== */}
      <div className="relative shrink-0 h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(197,139,42,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
};

export default QuestionCard;
