import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  Filter,
  Flame,
  Heart,
  History,
  LoaderCircle,
  Swords,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getSoloHistory,
  LEVEL_COLORS,
  LEVEL_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type SoloHistoryItem,
  type SoloLevel,
  type SoloStatus,
} from "../../api/soloApi";

type FilterTab = "all" | SoloStatus;

const SoloHistory = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState<SoloHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [levelFilter, setLevelFilter] = useState<"" | SoloLevel>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // ==================== Load ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getSoloHistory({
        status: filter === "all" ? undefined : filter,
        level: levelFilter || undefined,
        page,
        limit: pagination.limit,
      });
      setMatches(result.matches);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load solo history:", err);
      setError("دریافت تاریخچه انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, levelFilter]);

  // ==================== Formatters ====================
  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs} ثانیه`;
    return `${minutes}:${String(secs).padStart(2, "0")} دقیقه`;
  };

  // ==================== Tabs ====================
  const tabs: { key: FilterTab; label: string; icon: typeof Trophy }[] = [
    { key: "all", label: "همه", icon: History },
    { key: "won", label: "برنده", icon: Trophy },
    { key: "lost", label: "باخته", icon: XCircle },
    { key: "abandoned", label: "انصراف", icon: X },
  ];

  const levelOptions: { key: "" | SoloLevel; label: string }[] = [
    { key: "", label: "همه سطوح" },
    { key: "easy", label: "آسان" },
    { key: "medium", label: "متوسط" },
    { key: "hard", label: "سخت" },
  ];

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
      {/* پسزمینه */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-6">
        {/* ==================== Back ==================== */}
        <button
          type="button"
          onClick={() => navigate("/arena")}
          className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-400 transition"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به آرنا
        </button>

        {/* ==================== هدر ==================== */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <History size={32} strokeWidth={2.3} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-right">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                  Solo History
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                تاریخچه بازیهای انفرادی
              </h1>

              <p className="mt-1.5 text-sm text-gray-400">
                {pagination.total > 0
                  ? `${pagination.total.toLocaleString("fa-IR")} بازی ثبت شده`
                  : "هنوز بازیای ثبت نشده"}
              </p>
            </div>

            <div className="shrink-0 self-center sm:self-auto flex gap-2">
              {/* 🆕 دکمه آمار */}
              <button
                type="button"
                onClick={() => navigate("/solo/stats")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-black text-gray-300 text-xs hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
              >
                <BarChart3 size={13} />
                آمار
              </button>

              {/* بازی جدید */}
              <button
                type="button"
                onClick={() => navigate("/solo/setup")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-purple-500 to-purple-700 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-purple-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Swords size={13} />
                بازی جدید
              </button>
            </div>
          </div>
        </section>

        {/* ==================== Filters ==================== */}
        <section className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <div className="p-4 border-b border-white/5 space-y-3">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-xl px-3 py-2
                      text-[11px] font-black transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-l from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                          : "border border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/40 hover:text-purple-400"
                      }
                    `}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Level filter */}
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-gray-500" />
              <div className="flex flex-wrap gap-1.5">
                {levelOptions.map((opt) => {
                  const isActive = levelFilter === opt.key;
                  return (
                    <button
                      key={opt.key || "all"}
                      type="button"
                      onClick={() => setLevelFilter(opt.key)}
                      className={`
                        inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
                        text-[10px] font-black transition-all
                        ${
                          isActive
                            ? "bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] border border-[var(--griffin-gold)]/30"
                            : "border border-white/5 bg-white/[0.02] text-gray-500 hover:border-[var(--griffin-gold)]/30 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ==================== List ==================== */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-3">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <LoaderCircle
                      size={24}
                      className="text-white animate-spin"
                    />
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-500">
                  در حال دریافت تاریخچه...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle size={28} className="mx-auto text-rose-500 mb-3" />
              <p className="text-sm font-bold text-rose-400">{error}</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <History size={28} className="text-gray-500" />
              </div>
              <p className="font-heading text-sm font-black text-gray-400">
                {filter === "all"
                  ? "هنوز بازیای نداری"
                  : filter === "won"
                    ? "هنوز بازیای رو نبردی"
                    : filter === "lost"
                      ? "هنوز بازیای رو نباختی"
                      : "هنوز از بازیای انصراف ندادی"}
              </p>
              <button
                type="button"
                onClick={() => navigate("/solo/setup")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-purple-500 to-purple-700 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-500/40 hover:shadow-xl transition-all"
              >
                <Swords size={13} />
                شروع بازی جدید
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onView={() => navigate(`/solo/${match.id}/result`)}
                />
              ))}
            </div>
          )}

          {/* ==================== Pagination ==================== */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/5">
              <span className="text-[10px] font-bold text-gray-500">
                صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                {pagination.totalPages.toLocaleString("fa-IR")}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => void load(pagination.page - 1)}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/40 hover:text-purple-400 disabled:opacity-30 transition-all text-[10px] font-black"
                >
                  قبلی
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => void load(pagination.page + 1)}
                  className="px-3 py-2 rounded-lg bg-gradient-to-l from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30 disabled:opacity-30 transition-all text-[10px] font-black"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

// ==================== MatchCard ====================
interface MatchCardProps {
  match: SoloHistoryItem;
  onView: () => void;
}

const MatchCard = ({ match, onView }: MatchCardProps) => {
  const levelColors = LEVEL_COLORS[match.level];
  const statusColors = STATUS_COLORS[match.status];

  const StatusIcon =
    match.status === "won"
      ? Trophy
      : match.status === "lost"
        ? XCircle
        : match.status === "playing"
          ? LoaderCircle
          : X;

  const formatDuration = (ms: number | null) => {
    if (!ms) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs} ثانیه`;
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  return (
    <button
      type="button"
      onClick={onView}
      className="
        group relative w-full text-right
        rounded-2xl overflow-hidden
        border border-white/5 bg-white/[0.02]
        hover:bg-purple-500/5 hover:border-purple-500/30
        p-4 transition-all duration-300 hover:-translate-y-0.5
      "
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* === آیکون وضعیت === */}
        <div
          className={`
            w-12 h-12 rounded-xl shrink-0
            flex items-center justify-center
            ${statusColors.bg} ${statusColors.text}
          `}
        >
          <StatusIcon
            size={22}
            strokeWidth={2.4}
            className={match.status === "playing" ? "animate-spin" : ""}
          />
        </div>

        {/* === اطلاعات === */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* وضعیت */}
            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                text-[10px] font-black
                ${statusColors.bg} ${statusColors.text}
              `}
            >
              {STATUS_LABELS[match.status]}
            </span>

            {/* سطح */}
            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                text-[10px] font-black
                ${levelColors.bg} ${levelColors.text}
              `}
            >
              <Target size={10} />
              {LEVEL_LABELS[match.level]}
            </span>

            {/* لیگ */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 text-[10px] font-black">
              <Swords size={10} />
              {match.league.title}
            </span>
          </div>

          {/* آمار */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <CheckCircle2 size={11} />
              {match.correctAnswers.toLocaleString("fa-IR")} درست
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
              <XCircle size={11} />
              {(match.wrongAnswers + match.timeouts).toLocaleString(
                "fa-IR",
              )}{" "}
              غلط
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400">
              <Heart size={11} />
              {match.livesRemaining.toLocaleString("fa-IR")} جان
            </span>
          </div>

          {/* تاریخ */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar size={9} />
              {formatDate(match.finishedAt || match.startedAt)}
            </span>
            {match.totalTimeMs && (
              <span className="inline-flex items-center gap-1">
                <Clock3 size={9} />
                {formatDuration(match.totalTimeMs)}
              </span>
            )}
          </div>
        </div>

        {/* === برنده/باخته === */}
        {match.status === "won" && (
          <Trophy
            size={20}
            className="shrink-0 text-[var(--griffin-gold)] drop-shadow-[0_0_8px_rgba(197,139,42,0.6)]"
          />
        )}
        {match.status === "lost" && (
          <Flame size={20} className="shrink-0 text-rose-500/60" />
        )}
      </div>
    </button>
  );
};

export default SoloHistory;
