import {
  CheckCircle2,
  CircleX,
  Flame,
  Hourglass,
  Lock,
  TimerReset,
  Zap,
} from "lucide-react";

interface RoundFeedbackProps {
  isCorrect: boolean;
  result: "correct" | "wrong" | "timeout";
  questionFinished: boolean;
}

const RoundFeedback = ({
  isCorrect,
  result,
  questionFinished,
}: RoundFeedbackProps) => {
  const timeout = result === "timeout";
  const waiting = result === "wrong" && !questionFinished;

  const config = isCorrect
    ? {
        title: "پاسخ صحیح!",
        shortTitle: "صحیح",
        description: "یک Life از حریف کم شد",
        Icon: CheckCircle2,
        palette: {
          border: "border-emerald-500/40",
          bg: "bg-gradient-to-l from-emerald-500/15 via-emerald-500/10 to-transparent",
          text: "text-emerald-400",
          glow: "bg-emerald-500",
          badge: "bg-emerald-500 text-white",
          shadow: "shadow-[0_0_25px_rgba(16,185,129,0.25)]",
        },
      }
    : timeout
      ? {
          title: "زمان تمام شد",
          shortTitle: "Timeout",
          description: "پاسخی ثبت نشد، یک Life از دست رفت",
          Icon: TimerReset,
          palette: {
            border: "border-amber-500/40",
            bg: "bg-gradient-to-l from-amber-500/15 via-amber-500/10 to-transparent",
            text: "text-amber-400",
            glow: "bg-amber-500",
            badge: "bg-amber-500 text-white",
            shadow: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
          },
        }
      : waiting
        ? {
            title: "قفل شدی",
            shortTitle: "در انتظار",
            description: "حریف هنوز فرصت پاسخ دارد",
            Icon: Hourglass,
            palette: {
              border: "border-amber-500/40",
              bg: "bg-gradient-to-l from-amber-500/15 via-amber-500/10 to-transparent",
              text: "text-amber-400",
              glow: "bg-amber-500",
              badge: "bg-amber-500 text-white",
              shadow: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
            },
          }
        : {
            title: "پاسخ اشتباه",
            shortTitle: "اشتباه",
            description: "هر دو اشتباه؛ یک Life از هر دو کم شد",
            Icon: CircleX,
            palette: {
              border: "border-rose-500/40",
              bg: "bg-gradient-to-l from-rose-500/15 via-rose-500/10 to-transparent",
              text: "text-rose-400",
              glow: "bg-rose-500",
              badge: "bg-rose-500 text-white",
              shadow: "shadow-[0_0_25px_rgba(244,63,94,0.25)]",
            },
          };

  const { Icon, palette, title, description, shortTitle } = config;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-sm
        ${palette.border} ${palette.bg} ${palette.shadow}
        animate-[fadeInUp_0.4s_ease-out]
      `}
    >
      {/* 🔹 خط رنگی سمت راست */}
      <div
        className={`
          absolute top-0 right-0 bottom-0 w-0.5
          bg-gradient-to-b from-transparent via-current to-transparent
          ${palette.text}
        `}
      />

      {/* 🔹 هاله کوچک گوشه */}
      <div
        className={`
          absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-30
          ${palette.glow}
        `}
      />

      <div className="relative flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3">
        {/* ==================== آیکون ==================== */}
        <div className="relative shrink-0">
          <div
            className={`
              relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl
              flex items-center justify-center
              ${palette.badge}
              shadow-md
              ${isCorrect ? "rotate-3" : ""}
              ${waiting ? "animate-pulse" : ""}
              ${timeout ? "animate-bounce" : ""}
            `}
          >
            <Icon
              className={`
                h-4 w-4 sm:h-5 sm:w-5
                ${waiting ? "animate-spin" : ""}
              `}
              strokeWidth={2.5}
            />
          </div>

          {/* ستاره برای صحیح */}
          {isCorrect && (
            <Zap
              size={10}
              className="absolute -top-1 -right-1 text-yellow-400 drop-shadow-md animate-bounce"
              fill="currentColor"
            />
          )}
        </div>

        {/* ==================== متن ==================== */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p
              className={`
                font-heading text-xs sm:text-sm font-black
                ${palette.text}
              `}
            >
              {title}
            </p>

            {/* بج کوتاه */}
            <span
              className={`
                inline-flex items-center gap-1
                px-1.5 py-0.5 rounded-full
                text-[8px] font-black
                ${palette.badge}
              `}
            >
              {isCorrect ? (
                <>
                  <Zap size={7} fill="currentColor" />
                  {shortTitle}
                </>
              ) : timeout ? (
                <>
                  <Flame size={7} />
                  {shortTitle}
                </>
              ) : waiting ? (
                <>
                  <Lock size={7} />
                  {shortTitle}
                </>
              ) : (
                <>
                  <CircleX size={7} />
                  {shortTitle}
                </>
              )}
            </span>
          </div>

          <p className="text-[10px] sm:text-[11px] leading-5 text-gray-300 mt-0.5 truncate">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoundFeedback;
