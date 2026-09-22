import { useEffect, useState } from "react";
import {
  Award,
  Check,
  Crown,
  Eye,
  Flame,
  Heart,
  LoaderCircle,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import PerformanceInsights from "./PerformanceInsights";
import RevealOnScroll from "../../../components/common/RevealOnScroll";

interface MatchSummary {
  result: "win" | "loss" | "draw";
  isFriendly: boolean;
  player: { lives: number };
  opponent: { firstName?: string; lastName?: string; lives: number } | null;
  stats: {
    totalQuestions: number;
    correct: number;
    wrong: number;
    timeout: number;
    averageResponseTimeMs: number | null;
    opponent: {
      correct: number;
      wrong: number;
      timeout: number;
      averageResponseTimeMs: number | null;
    };
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
    ownAnswer: {
      selectedAnswer: number | null;
      isCorrect: boolean;
      responseTimeMs: number | null;
    } | null;
    opponentAnswer: {
      selectedAnswer: number | null;
      isCorrect: boolean;
      responseTimeMs: number | null;
    } | null;
  }>;
}

interface MatchResultProps {
  matchId: string;
  winnerId?: string | null;
  currentUserId?: string;
}

// 🔹 ذرات ثابت (بدون Math.random)
const CONFETTI_PARTICLES = [
  { top: "10%", left: "8%", delay: "0s", size: 4 },
  { top: "20%", left: "88%", delay: "0.3s", size: 3 },
  { top: "35%", left: "15%", delay: "0.6s", size: 5 },
  { top: "45%", left: "75%", delay: "0.2s", size: 3 },
  { top: "55%", left: "25%", delay: "0.5s", size: 4 },
  { top: "65%", left: "85%", delay: "0.8s", size: 3 },
  { top: "75%", left: "10%", delay: "0.4s", size: 4 },
  { top: "85%", left: "65%", delay: "0.7s", size: 5 },
  { top: "15%", left: "45%", delay: "0.9s", size: 3 },
  { top: "30%", left: "60%", delay: "0.35s", size: 4 },
  { top: "60%", left: "50%", delay: "0.55s", size: 3 },
  { top: "80%", left: "35%", delay: "0.25s", size: 4 },
];

const MatchResult = ({
  matchId,
  winnerId,
  currentUserId,
}: MatchResultProps) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<MatchSummary | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get(`/arena/matches/${matchId}/summary`)
      .then((response) => {
        if (active) setSummary(response.data);
      })
      .catch((error) => console.error("Failed to load match summary:", error));
    return () => {
      active = false;
    };
  }, [matchId]);

  const isDraw = !winnerId;
  const isWinner = winnerId === currentUserId;
  const title = isDraw ? "مساوی" : isWinner ? "پیروزی" : "شکست";
  const subtitle = isDraw
    ? "نبرد بدون برنده به پایان رسید."
    : isWinner
      ? "حریف را شکست دادی."
      : "این نبرد تمام شد؛ راند بعدی برای جبران آماده است.";
  const ratingChange = summary?.rating?.change ?? null;
  const opponentName = summary?.opponent
    ? `${summary.opponent.firstName ?? ""} ${summary.opponent.lastName ?? ""}`.trim()
    : "حریف";
  const isFriendly = summary?.isFriendly ?? false;

  return (
    <section className="relative mx-auto max-w-4xl space-y-4 sm:space-y-5">
      {/* ==================== Hero نتیجه ==================== */}
      <div
        className={`
          relative rounded-2xl sm:rounded-[2rem] overflow-hidden p-5 sm:p-10 text-center
          border shadow-2xl backdrop-blur-xl
          ${
            isDraw
              ? "border-slate-400/40 bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-transparent shadow-slate-500/20"
              : isWinner
                ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent shadow-emerald-500/20"
                : "border-rose-500/40 bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-transparent shadow-rose-500/20"
          }
        `}
      >
        <div
          className={`
            absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none
            ${isDraw ? "bg-slate-500/30" : isWinner ? "bg-emerald-500/30" : "bg-rose-500/30"}
          `}
        />
        <div
          className={`
            absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none
            ${isDraw ? "bg-slate-500/20" : isWinner ? "bg-emerald-500/20" : "bg-rose-500/20"}
          `}
        />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {isWinner &&
          CONFETTI_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)] pointer-events-none"
              style={{
                top: p.top,
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                animationDelay: p.delay,
                opacity: 0.5,
              }}
            />
          ))}

        <div className="relative space-y-4 sm:space-y-5">
          {/* آیکون نتیجه */}
          <div className="relative inline-flex">
            <div
              className={`
                absolute inset-0 blur-3xl opacity-70 animate-pulse
                ${isDraw ? "bg-slate-500" : isWinner ? "bg-emerald-500" : "bg-rose-500"}
              `}
            />
            <div
              className={`
                relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl
                flex items-center justify-center
                shadow-2xl rotate-3 border-2
                ${
                  isDraw
                    ? "bg-gradient-to-br from-slate-400 to-slate-600 border-slate-300/30 shadow-slate-500/40"
                    : isWinner
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-300/30 shadow-emerald-500/40"
                      : "bg-gradient-to-br from-rose-500 to-rose-700 border-rose-300/30 shadow-rose-500/40"
                }
              `}
            >
              {isDraw ? (
                <Swords
                  className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                  strokeWidth={2.2}
                />
              ) : isWinner ? (
                <Crown
                  className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                  strokeWidth={2.2}
                />
              ) : (
                <Shield
                  className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                  strokeWidth={2.2}
                />
              )}
            </div>

            {isWinner && (
              <>
                <Sparkles
                  size={18}
                  className="absolute -top-2 -right-2 text-[var(--griffin-gold)] animate-pulse"
                />
                <Zap
                  size={14}
                  className="absolute -bottom-1 -left-2 text-[var(--griffin-gold)] animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </>
            )}
          </div>

          {/* 🆕 badge نبرد دوستانه */}
          {isFriendly && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 backdrop-blur-sm">
              <UserPlus size={11} className="text-purple-500" />
              <span className="text-[10px] font-black tracking-widest uppercase text-purple-500">
                نبرد دوستانه
              </span>
            </div>
          )}

          <div
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border
              ${
                isDraw
                  ? "bg-slate-500/10 border-slate-500/30"
                  : isWinner
                    ? "bg-emerald-500/15 border-emerald-500/30"
                    : "bg-rose-500/15 border-rose-500/30"
              }
            `}
          >
            <Swords
              size={11}
              className={
                isDraw
                  ? "text-slate-400"
                  : isWinner
                    ? "text-emerald-500"
                    : "text-rose-500"
              }
            />
            <span
              className={`
                text-[10px] font-black tracking-widest uppercase
                ${
                  isDraw
                    ? "text-slate-400"
                    : isWinner
                      ? "text-emerald-500"
                      : "text-rose-500"
                }
              `}
            >
              Battle Completed
            </span>
          </div>

          <h2
            className={`
              font-heading text-4xl sm:text-5xl md:text-6xl font-black leading-none
              ${
                isDraw
                  ? "text-slate-400"
                  : isWinner
                    ? "text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-600"
                    : "text-transparent bg-clip-text bg-gradient-to-b from-rose-400 to-rose-600"
              }
            `}
          >
            {title}
          </h2>

          <p className="mx-auto max-w-md text-xs sm:text-sm leading-7 text-gray-400">
            {subtitle}
          </p>

          {/* 🆕 نمایش Rating یا پیام دوستانه */}
          {isFriendly ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
              <UserPlus size={14} className="text-purple-500" />
              <p className="text-xs font-black text-purple-500">
                نبرد دوستانه — Rating تغییری نمی‌کنه
              </p>
            </div>
          ) : (
            ratingChange !== null && (
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Trophy size={16} className="text-[var(--griffin-gold)]" />
                <div className="text-right">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    تغییر Rating
                  </p>
                  <p
                    className={`
                      font-heading text-lg sm:text-2xl font-black inline-flex items-center gap-1
                      ${ratingChange >= 0 ? "text-emerald-500" : "text-rose-500"}
                    `}
                  >
                    {ratingChange >= 0 ? (
                      <TrendingUp size={16} className="sm:w-5 sm:h-5" />
                    ) : (
                      <TrendingDown size={16} className="sm:w-5 sm:h-5" />
                    )}
                    {ratingChange > 0 ? "+" : ""}
                    {ratingChange.toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ==================== محتوای اصلی ==================== */}
      {summary ? (
        <>
          <RevealOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {[
                {
                  icon: Target,
                  label: "پاسخ صحیح",
                  value: `${summary.stats.correct.toLocaleString("fa-IR")}/${summary.stats.totalQuestions.toLocaleString("fa-IR")}`,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  icon: X,
                  label: "اشتباه",
                  value: summary.stats.wrong.toLocaleString("fa-IR"),
                  color: "text-rose-500",
                  bg: "bg-rose-500/10",
                },
                {
                  icon: Timer,
                  label: "میانگین زمان",
                  value:
                    summary.stats.averageResponseTimeMs == null
                      ? "—"
                      : `${(summary.stats.averageResponseTimeMs / 1000).toFixed(1)}s`,
                  color: "text-[var(--griffin-gold)]",
                  bg: "bg-[var(--griffin-gold)]/10",
                },
                {
                  icon: Heart,
                  label: "Life باقی‌مانده",
                  value: summary.player.lives.toLocaleString("fa-IR"),
                  color: "text-[var(--griffin-gold)]",
                  bg: "bg-[var(--griffin-gold)]/10",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-sm p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--griffin-gold)]/5"
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${stat.bg} flex items-center justify-center mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={14} className={stat.color} />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <p
                      className={`font-heading text-lg sm:text-2xl font-black mt-1 ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <PerformanceComparison
              stats={summary.stats}
              opponentName={opponentName}
            />
          </RevealOnScroll>

          <RevealOnScroll>
            <PerformanceInsights stats={summary.stats} />
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-white/5">
                <div className="flex items-end justify-between flex-wrap gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-1.5">
                      <Flame size={13} className="text-[var(--griffin-gold)]" />
                      <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Battle Report
                      </span>
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-black text-white">
                      عملکرد سؤال‌به‌سؤال
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-[10px] sm:text-xs font-bold text-gray-400">
                    <Eye size={12} />
                    مرور نبرد
                  </div>
                </div>

                <BattleTimeline
                  items={summary.questionPerformance}
                  currentUserId={currentUserId}
                />
              </div>

              <div className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                {summary.questionPerformance.map((item, index) => {
                  const own = item.ownAnswer;
                  const status = own?.isCorrect
                    ? "correct"
                    : own
                      ? "wrong"
                      : "timeout";
                  const statusLabel =
                    status === "correct"
                      ? "صحیح"
                      : status === "wrong"
                        ? "غلط"
                        : "Timeout";
                  const winnerLabel =
                    item.winnerId === currentUserId
                      ? "برد این راند"
                      : item.winnerId
                        ? "برد حریف"
                        : "هر دو اشتباه";

                  return (
                    <RevealOnScroll key={item.order} delay={index * 40}>
                      <details
                        className={`
                          group rounded-xl sm:rounded-2xl overflow-hidden
                          border transition-all duration-300
                          ${
                            status === "correct"
                              ? "border-emerald-500/20 bg-gradient-to-l from-emerald-500/5 to-transparent"
                              : status === "wrong"
                                ? "border-rose-500/20 bg-gradient-to-l from-rose-500/5 to-transparent"
                                : "border-amber-500/20 bg-gradient-to-l from-amber-500/5 to-transparent"
                          }
                          hover:border-[var(--griffin-gold)]/40
                        `}
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-2 sm:gap-3 p-3 sm:p-4">
                          <span
                            className={`
                              flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl
                              font-heading font-black text-xs sm:text-sm
                              ${
                                status === "correct"
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : status === "wrong"
                                    ? "bg-rose-500/15 text-rose-500"
                                    : "bg-amber-500/15 text-amber-500"
                              }
                            `}
                          >
                            {item.order.toLocaleString("fa-IR")}
                          </span>

                          <span className="min-w-0 flex-1 truncate text-xs sm:text-sm font-bold text-white">
                            {item.questionText}
                          </span>

                          <span
                            className={`
                              shrink-0 inline-flex items-center gap-1
                              px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg
                              text-[9px] sm:text-[10px] font-black
                              ${
                                status === "correct"
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : status === "wrong"
                                    ? "bg-rose-500/15 text-rose-500"
                                    : "bg-amber-500/15 text-amber-500"
                              }
                            `}
                          >
                            {status === "correct" ? (
                              <Check size={9} strokeWidth={3} />
                            ) : status === "wrong" ? (
                              <X size={9} strokeWidth={3} />
                            ) : (
                              <Timer size={9} />
                            )}
                            {statusLabel}
                          </span>
                        </summary>

                        <div className="border-t border-white/5 px-3 sm:px-4 pb-3 sm:pb-4 pt-3 sm:pt-4">
                          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                            <AnswerReview
                              label="پاسخ تو"
                              answer={own?.selectedAnswer ?? null}
                              correctAnswer={item.correctAnswer}
                              isCorrect={own?.isCorrect ?? false}
                              responseTimeMs={own?.responseTimeMs ?? null}
                            />
                            <AnswerReview
                              label="پاسخ حریف"
                              answer={
                                item.opponentAnswer?.selectedAnswer ?? null
                              }
                              correctAnswer={item.correctAnswer}
                              isCorrect={
                                item.opponentAnswer?.isCorrect ?? false
                              }
                              responseTimeMs={
                                item.opponentAnswer?.responseTimeMs ?? null
                              }
                            />
                          </div>

                          <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3">
                            <span
                              className={`
                                inline-flex items-center gap-1.5
                                px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg
                                text-[9px] sm:text-[10px] font-black
                                ${
                                  item.winnerId === currentUserId
                                    ? "bg-emerald-500/15 text-emerald-500"
                                    : item.winnerId
                                      ? "bg-rose-500/15 text-rose-500"
                                      : "bg-gray-500/15 text-gray-500"
                                }
                              `}
                            >
                              <Crown size={9} />
                              {winnerLabel}
                            </span>

                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">
                              گزینه صحیح: {item.correctAnswer + 1}
                            </span>
                          </div>
                        </div>
                      </details>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Swords size={14} />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    حریف
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-heading font-black text-sm sm:text-base text-white">
                    {opponentName}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-heading font-black text-[var(--griffin-gold)] text-sm sm:text-base">
                    <Heart size={13} fill="currentColor" />
                    {(summary.opponent?.lives ?? 0).toLocaleString("fa-IR")}
                  </span>
                </div>
              </div>

              {summary.rating && !isFriendly && (
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--griffin-gold)]/10 flex items-center justify-center text-[var(--griffin-gold)]">
                      <Trophy size={14} />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Rating
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      dir="ltr"
                      className="font-heading font-black text-sm sm:text-base text-white tabular-nums"
                    >
                      {summary.rating.oldRating.toLocaleString("fa-IR")}
                      <span className="text-gray-500 mx-1.5">→</span>
                      {summary.rating.newRating.toLocaleString("fa-IR")}
                    </span>
                    {ratingChange !== null && (
                      <span
                        className={`
                          inline-flex items-center gap-1 font-heading font-black text-sm sm:text-base
                          ${ratingChange >= 0 ? "text-emerald-500" : "text-rose-500"}
                        `}
                      >
                        {ratingChange >= 0 ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {ratingChange > 0 ? "+" : ""}
                        {ratingChange.toLocaleString("fa-IR")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </RevealOnScroll>
        </>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center gap-3 text-sm font-bold text-gray-400">
          <LoaderCircle className="animate-spin" size={20} />
          در حال دریافت خلاصه نبرد...
        </div>
      )}

      <RevealOnScroll>
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 sm:px-7 py-3 sm:py-3.5 font-black text-white text-sm sm:text-base shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <RotateCcw
                size={16}
                className="transition-transform group-hover:rotate-180 duration-500"
              />
              نبرد جدید
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-5 sm:px-7 py-3 sm:py-3.5 font-bold text-gray-200 text-sm sm:text-base hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 transition-all"
          >
            بازگشت به Arena
          </button>
        </div>
      </RevealOnScroll>
    </section>
  );
};

// ==================== Battle Timeline ====================
const BattleTimeline = ({
  items,
  currentUserId,
}: {
  items: MatchSummary["questionPerformance"];
  currentUserId?: string;
}) => (
  <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
    <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
      <div>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
          Match Timeline
        </p>
        <p className="mt-0.5 text-[10px] sm:text-xs font-bold text-gray-400">
          مسیر نبرد در یک نگاه
        </p>
      </div>
      <span className="text-[9px] sm:text-[10px] font-black text-gray-400">
        {items.length.toLocaleString("fa-IR")} راند
      </span>
    </div>

    <div className="flex items-start">
      {items.map((item, index) => {
        const ownWon = item.winnerId === currentUserId;
        const opponentWon = Boolean(item.winnerId) && !ownWon;
        const drawRound = !item.winnerId;
        const ownAnswered = item.ownAnswer !== null;
        const ownCorrect = item.ownAnswer?.isCorrect === true;

        const nodeClass = ownWon
          ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ring-emerald-500/20 shadow-md shadow-emerald-500/30"
          : opponentWon
            ? "bg-gradient-to-br from-rose-500 to-rose-700 text-white ring-rose-500/20 shadow-md shadow-rose-500/30"
            : "bg-gradient-to-br from-amber-500 to-amber-700 text-white ring-amber-500/20 shadow-md shadow-amber-500/30";

        return (
          <div key={item.order} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div
                className={`flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[10px] sm:text-xs font-black ring-2 sm:ring-4 ${nodeClass}`}
              >
                {item.order.toLocaleString("fa-IR")}
              </div>
              <p className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] font-black text-gray-400">
                {drawRound ? "مساوی" : ownWon ? "برد" : "باخت"}
              </p>
              <p
                className={`mt-0.5 text-[7px] sm:text-[9px] font-bold ${
                  ownCorrect
                    ? "text-emerald-500"
                    : ownAnswered
                      ? "text-rose-500"
                      : "text-amber-500"
                }`}
              >
                {ownCorrect ? "صحیح" : ownAnswered ? "غلط" : "بدون پاسخ"}
              </p>
            </div>
            {index < items.length - 1 && (
              <div
                className={`
                  mt-3 sm:mt-5 h-px min-w-1 sm:min-w-2 flex-1
                  ${
                    ownWon
                      ? "bg-emerald-500/40"
                      : opponentWon
                        ? "bg-rose-500/40"
                        : "bg-amber-500/40"
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ==================== Answer Review ====================
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
  <div
    className={`
      rounded-lg sm:rounded-xl border p-2.5 sm:p-3 transition-colors
      ${
        answer === null
          ? "border-amber-500/20 bg-amber-500/5"
          : isCorrect
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-rose-500/20 bg-rose-500/5"
      }
    `}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] sm:text-xs font-black text-gray-400">
        {label}
      </span>
      {answer !== null ? (
        isCorrect ? (
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check
              className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500"
              strokeWidth={3}
            />
          </div>
        ) : (
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
            <X
              className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-rose-500"
              strokeWidth={3}
            />
          </div>
        )
      ) : (
        <span className="text-[9px] sm:text-[10px] font-black text-amber-500">
          بدون پاسخ
        </span>
      )}
    </div>
    <p className="mt-1.5 sm:mt-2 font-heading text-xs sm:text-sm font-black text-white">
      {answer === null ? "—" : `گزینه ${(answer + 1).toLocaleString("fa-IR")}`}
    </p>
    <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] font-bold text-gray-400">
      {answer === correctAnswer
        ? "پاسخ صحیح"
        : `پاسخ صحیح: گزینه ${(correctAnswer + 1).toLocaleString("fa-IR")}`}
      {responseTimeMs !== null && (
        <>
          {" · "}
          <span className="text-[var(--griffin-gold)] font-black">
            {(responseTimeMs / 1000).toFixed(2)}s
          </span>
        </>
      )}
    </p>
  </div>
);

// ==================== Performance Comparison ====================
const PerformanceComparison = ({
  stats,
  opponentName,
}: {
  stats: MatchSummary["stats"];
  opponentName: string;
}) => {
  const accuracy = stats.totalQuestions
    ? Math.round((stats.correct / stats.totalQuestions) * 100)
    : 0;
  const opponentAccuracy = stats.totalQuestions
    ? Math.round((stats.opponent.correct / stats.totalQuestions) * 100)
    : 0;
  const ownTime = stats.averageResponseTimeMs;
  const opponentTime = stats.opponent.averageResponseTimeMs;
  const faster =
    ownTime !== null && opponentTime !== null ? ownTime < opponentTime : null;

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4 sm:p-7">
      <div className="mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 mb-1.5">
          <Award size={13} className="text-[var(--griffin-gold)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Match Stats
          </span>
        </div>
        <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-black text-white">
          تحلیل عملکرد
        </h3>
        <div className="w-12 sm:w-16 h-1 bg-[var(--griffin-gold)] mt-2 sm:mt-3 rounded-full" />
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400">
          مقایسه مستقیم عملکرد تو با {opponentName}
        </p>
      </div>

      <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
        <CompareCard
          label="دقت پاسخ‌گویی"
          own={`${accuracy}%`}
          opponent={`${opponentAccuracy}%`}
          ownValue={accuracy}
          opponentValue={opponentAccuracy}
        />
        <CompareCard
          label="برد راند"
          own={stats.roundsWon.toLocaleString("fa-IR")}
          opponent={stats.opponentRoundsWon.toLocaleString("fa-IR")}
          ownValue={stats.roundsWon}
          opponentValue={stats.opponentRoundsWon}
        />
        <CompareCard
          label="میانگین سرعت"
          own={ownTime === null ? "—" : `${(ownTime / 1000).toFixed(2)}s`}
          opponent={
            opponentTime === null ? "—" : `${(opponentTime / 1000).toFixed(2)}s`
          }
          ownValue={ownTime === null ? 0 : -ownTime}
          opponentValue={opponentTime === null ? 0 : -opponentTime}
        />
      </div>

      <div className="mt-4 sm:mt-5 rounded-lg sm:rounded-xl border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/5 p-3 sm:p-4 text-[11px] sm:text-xs font-bold leading-6 text-gray-300">
        {stats.roundsWon > stats.opponentRoundsWon
          ? `برتری اصلی تو در برد راندها بود: ${stats.roundsWon.toLocaleString("fa-IR")} راند در برابر ${stats.opponentRoundsWon.toLocaleString("fa-IR")} راند.`
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

// ==================== Compare Card ====================
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
  const ownWidth = Math.abs(ownValue) / max;
  const opponentWidth = Math.abs(opponentValue) / max;

  const ownIsBetter = ownValue > opponentValue;
  const oppIsBetter = opponentValue > ownValue;

  return (
    <div className="rounded-lg sm:rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
      <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">
        {label}
      </p>
      <div className="space-y-2.5 sm:space-y-3">
        <CompareRow
          label="تو"
          value={own}
          width={ownWidth * 100}
          color="gold"
          isLeading={ownIsBetter}
        />
        <CompareRow
          label="حریف"
          value={opponent}
          width={opponentWidth * 100}
          color="purple"
          isLeading={oppIsBetter}
        />
      </div>
    </div>
  );
};

const CompareRow = ({
  label,
  value,
  width,
  color,
  isLeading,
}: {
  label: string;
  value: string | number;
  width: number;
  color: "gold" | "purple";
  isLeading: boolean;
}) => (
  <div>
    <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-black mb-1">
      <span className="inline-flex items-center gap-1">
        {isLeading && <Crown size={9} className="text-[var(--griffin-gold)]" />}
        <span className="text-gray-300">{label}</span>
      </span>
      <span className="text-white">{value}</span>
    </div>
    <div className="h-1 sm:h-1.5 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${
          color === "gold"
            ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400"
            : "bg-gradient-to-l from-purple-500 to-purple-400"
        }`}
        style={{ width: `${Math.max(width, 6)}%` }}
      />
    </div>
  </div>
);

export default MatchResult;
