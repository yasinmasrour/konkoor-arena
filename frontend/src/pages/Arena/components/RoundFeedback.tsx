import { CheckCircle2, CircleX, Hourglass, TimerReset } from "lucide-react";

interface RoundFeedbackProps {
  isCorrect: boolean;
  result: "correct" | "wrong" | "timeout";
  questionFinished: boolean;
}

const RoundFeedback = ({ isCorrect, result, questionFinished }: RoundFeedbackProps) => {
  const timeout = result === "timeout";
  const waiting = result === "wrong" && !questionFinished;

  const title = isCorrect
    ? "پاسخ صحیح"
    : timeout
      ? "زمان تمام شد"
      : waiting
        ? "قفل شدی"
        : "پاسخ اشتباه";

  const description = isCorrect
    ? "یک Life از حریف کم شد؛ سؤال بعدی در راه است."
    : timeout
      ? "برای این راند پاسخی ثبت نشد و Life از دست رفت."
      : waiting
        ? "پاسخ تو اشتباه بود؛ حریف هنوز فرصت پاسخ دارد."
        : "هر دو پاسخ اشتباه بود؛ یک Life از هر دو بازیکن کم شد.";

  const Icon = isCorrect ? CheckCircle2 : timeout ? TimerReset : waiting ? Hourglass : CircleX;
  const tone = isCorrect
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
    : waiting
      ? "border-amber-500/25 bg-amber-500/10 text-amber-500"
      : "border-rose-500/25 bg-rose-500/10 text-rose-500";

  return (
    <div className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${tone}`}>
      <Icon className="h-6 w-6 shrink-0" />
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default RoundFeedback;
