import { HelpCircle } from "lucide-react";
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
}: QuestionCardProps) => (
  <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] md:p-8">
    <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl" />
    <div className="relative mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <HelpCircle className="h-4 w-4 text-[var(--griffin-gold)]" />
        <span>اول سریع بخون، بعد انتخاب کن</span>
      </div>
      <div className="rounded-full border border-[var(--griffin-gold)]/25 bg-[var(--griffin-gold)]/10 px-3 py-1.5 text-xs font-black text-[var(--griffin-gold)]">
        {order} / {total}
      </div>
    </div>
    {questionImage && (
      <img
        src={questionImage}
        alt="تصویر سؤال"
        className="relative mb-6 max-h-80 w-full rounded-2xl border border-slate-200/70 object-contain dark:border-white/10"
      />
    )}
    <div className="relative text-right text-xl font-extrabold leading-10 text-slate-950 dark:text-white md:text-2xl">
      <MathText content={questionText} />
    </div>
  </section>
);

export default QuestionCard;
