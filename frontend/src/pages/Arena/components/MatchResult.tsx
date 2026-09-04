import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Crown, Eye, RotateCcw, Swords, Target, Timer, TrendingDown, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import PerformanceInsights from "./PerformanceInsights";

interface MatchSummary {
  result: "win" | "loss" | "draw";
  player: { lives: number };
  opponent: { firstName?: string; lastName?: string; lives: number } | null;
  stats: {
    totalQuestions: number;
    correct: number;
    wrong: number;
    timeout: number;
    averageResponseTimeMs: number | null;
    opponent: { correct: number; wrong: number; timeout: number; averageResponseTimeMs: number | null };
    roundsWon: number;
    opponentRoundsWon: number;
  };
  rating: { oldRating: number; newRating: number; change: number } | null;
  questionPerformance: Array<{
    order: number;
    questionText: string;
    options: string[];
    correctAnswer: number;
    winnerId: string | null;
    ownAnswer: { selectedAnswer: number | null; isCorrect: boolean; responseTimeMs: number | null } | null;
    opponentAnswer: { selectedAnswer: number | null; isCorrect: boolean; responseTimeMs: number | null } | null;
  }>;
}

interface MatchResultProps {
  matchId: string;
  winnerId?: string | null;
  currentUserId?: string;
}

const MatchResult = ({ matchId, winnerId, currentUserId }: MatchResultProps) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<MatchSummary | null>(null);

  useEffect(() => {
    let active = true;
    api.get(`/arena/matches/${matchId}/summary`)
      .then((response) => { if (active) setSummary(response.data); })
      .catch((error) => console.error("Failed to load match summary:", error));
    return () => { active = false; };
  }, [matchId]);

  const isDraw = !winnerId;
  const isWinner = winnerId === currentUserId;
  const title = isDraw ? "مساوی" : isWinner ? "پیروزی" : "شکست";
  const subtitle = isDraw ? "نبرد بدون برنده به پایان رسید." : isWinner ? "حریف را شکست دادی." : "این نبرد تمام شد؛ راند بعدی برای جبران آماده است.";
  const ratingChange = summary?.rating?.change ?? null;
  const opponentName = summary?.opponent
    ? `${summary.opponent.firstName ?? ""} ${summary.opponent.lastName ?? ""}`.trim()
    : "حریف";

  return (
    <section className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/85 p-5 shadow-[0_25px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] sm:p-8 md:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--griffin-gold)]" />
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
          {isDraw ? <Swords className="h-9 w-9" /> : isWinner ? <Crown className="h-9 w-9" /> : <ArrowLeft className="h-9 w-9" />}
        </div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--griffin-gold)]">GRIFFIN ARENA</p>
        <h2 className="mt-2 text-4xl font-black">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      {summary ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={<Target className="h-4 w-4" />} label="پاسخ صحیح" value={`${summary.stats.correct}/${summary.stats.totalQuestions}`} />
            <Stat icon={<Swords className="h-4 w-4" />} label="اشتباه" value={summary.stats.wrong} />
            <Stat icon={<Timer className="h-4 w-4" />} label="میانگین زمان" value={summary.stats.averageResponseTimeMs == null ? "—" : `${(summary.stats.averageResponseTimeMs / 1000).toFixed(1)}s`} />
            <Stat icon={<Crown className="h-4 w-4" />} label="Life باقی‌مانده" value={summary.player.lives} />
          </div>

          <PerformanceComparison
            stats={summary.stats}
            opponentName={opponentName}
          />

          <PerformanceInsights stats={summary.stats} />

          <div className="mt-7 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--griffin-gold)]">BATTLE REPORT</p>
                <h3 className="mt-1 text-lg font-black">عملکرد سؤال‌به‌سؤال</h3>
              </div>
              <div className="hidden items-center gap-2 text-[11px] font-bold text-slate-500 sm:flex dark:text-slate-400">
                <Eye className="h-4 w-4" /> مرور نبرد
              </div>
            </div>
            <BattleTimeline
              items={summary.questionPerformance}
              currentUserId={currentUserId}
            />

            <div className="mt-4 space-y-3">
              {summary.questionPerformance.map((item) => {
                const own = item.ownAnswer;
                const status = own?.isCorrect ? "correct" : own ? "wrong" : "timeout";
                const statusLabel = status === "correct" ? "صحیح" : status === "wrong" ? "غلط" : "Timeout";
                const statusClass = status === "correct" ? "text-emerald-500" : status === "wrong" ? "text-rose-500" : "text-amber-500";
                const winnerLabel = item.winnerId === currentUserId ? "برد این راند" : item.winnerId ? "برد حریف" : "هر دو اشتباه";

                return (
                  <details key={item.order} className="group rounded-2xl border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.035]">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--griffin-gold)]/10 text-xs font-black text-[var(--griffin-gold)]">{item.order}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">{item.questionText}</span>
                      <span className={`shrink-0 text-xs font-black ${statusClass}`}>{statusLabel}</span>
                    </summary>
                    <div className="border-t border-slate-200/70 px-4 pb-4 pt-3 dark:border-white/10">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <AnswerReview label="پاسخ تو" answer={own?.selectedAnswer ?? null} correctAnswer={item.correctAnswer} isCorrect={own?.isCorrect ?? false} responseTimeMs={own?.responseTimeMs ?? null} />
                        <AnswerReview label="پاسخ حریف" answer={item.opponentAnswer?.selectedAnswer ?? null} correctAnswer={item.correctAnswer} isCorrect={item.opponentAnswer?.isCorrect ?? false} responseTimeMs={item.opponentAnswer?.responseTimeMs ?? null} />
                      </div>
                      <p className="mt-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">{winnerLabel} · گزینه صحیح: {item.correctAnswer + 1}</p>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">حریف</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-black">{opponentName}</span>
                <span className="text-sm font-black text-[var(--griffin-gold)]">{summary.opponent?.lives ?? 0} Life</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Rating</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-black">{summary.rating ? `${summary.rating.oldRating} → ${summary.rating.newRating}` : "ثبت نشده"}</span>
                {ratingChange !== null && <span className={`inline-flex items-center gap-1 font-black ${ratingChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{ratingChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{ratingChange > 0 ? "+" : ""}{ratingChange}</span>}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-5 text-center text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400">در حال دریافت خلاصه نبرد...</div>
      )}

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={() => navigate("/arena")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-6 py-3 font-black text-white shadow-[0_12px_35px_rgba(197,139,42,0.25)] transition hover:-translate-y-0.5 hover:brightness-105"><RotateCcw className="h-4 w-4" /> نبرد جدید</button>
        <button type="button" onClick={() => navigate("/arena")} className="rounded-xl border border-slate-200 px-6 py-3 font-bold dark:border-white/10">بازگشت به Arena</button>
      </div>
    </section>
  );
};

const BattleTimeline = ({
  items,
  currentUserId,
}: {
  items: MatchSummary["questionPerformance"];
  currentUserId?: string;
}) => (
  <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">MATCH TIMELINE</p>
        <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">مسیر نبرد در یک نگاه</p>
      </div>
      <span className="text-[10px] font-black text-slate-400">{items.length} راند</span>
    </div>

    <div className="mt-5 flex items-start">
      {items.map((item, index) => {
        const ownWon = item.winnerId === currentUserId;
        const opponentWon = Boolean(item.winnerId) && !ownWon;
        const drawRound = !item.winnerId;
        const ownAnswered = item.ownAnswer !== null;
        const ownCorrect = item.ownAnswer?.isCorrect === true;
        const nodeClass = ownWon
          ? "bg-emerald-500 text-white ring-emerald-500/20"
          : opponentWon
            ? "bg-rose-500 text-white ring-rose-500/20"
            : "bg-amber-500 text-white ring-amber-500/20";

        return (
          <div key={item.order} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ring-4 ${nodeClass}`}>
                {item.order}
              </div>
              <p className="mt-2 text-[10px] font-black text-slate-500 dark:text-slate-400">
                {drawRound ? "مساوی" : ownWon ? "برد" : "باخت"}
              </p>
              <p className={`mt-1 text-[9px] font-bold ${ownCorrect ? "text-emerald-500" : ownAnswered ? "text-rose-500" : "text-amber-500"}`}>
                {ownCorrect ? "صحیح" : ownAnswered ? "غلط" : "بدون پاسخ"}
              </p>
            </div>
            {index < items.length - 1 && (
              <div className="mt-4 h-px min-w-2 flex-1 bg-slate-200 dark:bg-white/10" />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const AnswerReview = ({
  label,
  answer,
  correctAnswer,
  isCorrect,
  responseTimeMs,
}: {
  label: string;
  answer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  responseTimeMs: number | null;
}) => (
  <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.025]">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-black text-slate-500 dark:text-slate-400">{label}</span>
      {answer !== null ? (isCorrect ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />) : <span className="text-[10px] font-black text-amber-500">بدون پاسخ</span>}
    </div>
    <p className="mt-2 text-sm font-black">{answer === null ? "—" : `گزینه ${answer + 1}`}</p>
    <p className="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">{answer === correctAnswer ? "پاسخ صحیح" : `پاسخ صحیح: گزینه ${correctAnswer + 1}`} {responseTimeMs !== null ? ` · ${(responseTimeMs / 1000).toFixed(2)}s` : ""}</p>
  </div>
);

const PerformanceComparison = ({
  stats,
  opponentName,
}: {
  stats: MatchSummary["stats"];
  opponentName: string;
}) => {
  const accuracy = stats.totalQuestions ? Math.round((stats.correct / stats.totalQuestions) * 100) : 0;
  const opponentAccuracy = stats.totalQuestions ? Math.round((stats.opponent.correct / stats.totalQuestions) * 100) : 0;
  const ownTime = stats.averageResponseTimeMs;
  const opponentTime = stats.opponent.averageResponseTimeMs;
  const faster = ownTime !== null && opponentTime !== null ? ownTime < opponentTime : null;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--griffin-gold)]">MATCH STATS</p>
        <h3 className="mt-1 text-lg font-black">چرا برنده شدی؟</h3>
        <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">مقایسه مستقیم عملکرد تو با {opponentName}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <CompareCard label="دقت پاسخ‌گویی" own={`${accuracy}%`} opponent={`${opponentAccuracy}%`} ownValue={accuracy} opponentValue={opponentAccuracy} />
        <CompareCard label="برد راند" own={stats.roundsWon} opponent={stats.opponentRoundsWon} ownValue={stats.roundsWon} opponentValue={stats.opponentRoundsWon} />
        <CompareCard
          label="میانگین سرعت"
          own={ownTime === null ? "—" : `${(ownTime / 1000).toFixed(2)}s`}
          opponent={opponentTime === null ? "—" : `${(opponentTime / 1000).toFixed(2)}s`}
          ownValue={ownTime === null ? 0 : -ownTime}
          opponentValue={opponentTime === null ? 0 : -opponentTime}
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs font-bold leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300">
        {stats.roundsWon > stats.opponentRoundsWon
          ? `برتری اصلی تو در برد راندها بود: ${stats.roundsWon} راند در برابر ${stats.opponentRoundsWon} راند.`
          : stats.roundsWon < stats.opponentRoundsWon
            ? `حریف راندهای بیشتری برد، اما نتیجه نهایی با معیارهای Match تعیین شد.`
            : faster === true
              ? "تعداد راندهای برده برابر بود و سرعت پاسخ‌گویی تو بهتر بود."
              : faster === false
                ? "تعداد راندهای برده برابر بود و حریف میانگین پاسخ سریع‌تری داشت."
                : "عملکرد دو بازیکن از نظر داده‌های قابل اندازه‌گیری نزدیک بود."}
      </div>
    </div>
  );
};

const CompareCard = ({
  label,
  own,
  opponent,
  ownValue,
  opponentValue,
}: {
  label: string;
  own: string | number;
  opponent: string | number;
  ownValue: number;
  opponentValue: number;
}) => {
  const max = Math.max(Math.abs(ownValue), Math.abs(opponentValue), 1);
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-3 space-y-2">
        <CompareRow label="تو" value={own} width={(Math.abs(ownValue) / max) * 100} />
        <CompareRow label="حریف" value={opponent} width={(Math.abs(opponentValue) / max) * 100} />
      </div>
    </div>
  );
};

const CompareRow = ({ label, value, width }: { label: string; value: string | number; width: number }) => (
  <div>
    <div className="flex items-center justify-between gap-2 text-[10px] font-black">
      <span>{label}</span><span>{value}</span>
    </div>
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
      <div className="h-full rounded-full bg-[var(--griffin-gold)]" style={{ width: `${Math.max(width, 6)}%` }} />
    </div>
  </div>
);

const Stat = ({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]">
    <div className="flex items-center gap-2 text-[var(--griffin-gold)]">{icon}<span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span></div>
    <p className="mt-2 text-xl font-black">{value}</p>
  </div>
);

export default MatchResult;
