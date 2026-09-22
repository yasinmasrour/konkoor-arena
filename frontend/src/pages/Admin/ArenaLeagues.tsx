import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  Layers,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  changeArenaLeagueStatus,
  deleteArenaLeague,
  listArenaLeagues,
  type ArenaLeagueAdmin,
} from "../../api/adminArenaApi";
import LeagueFormModal from "./components/LeagueFormModal";

const GRADES = [
  { value: "10", label: "دهم" },
  { value: "11", label: "یازدهم" },
  { value: "12", label: "دوازدهم" },
];

const MAJORS_LABELS: Record<string, string> = {
  math: "ریاضی",
  experimental: "تجربی",
  humanities: "انسانی",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "در انتظار",
  active: "فعال",
  finished: "پایان‌یافته",
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string; icon: typeof Clock3 }
> = {
  upcoming: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: Clock3,
  },
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  finished: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
    icon: Trophy,
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ArenaLeagues = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<ArenaLeagueAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<ArenaLeagueAdmin | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ==================== Load ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await listArenaLeagues({
        page,
        limit: pagination.limit,
        status:
          (statusFilter as "upcoming" | "active" | "finished") || undefined,
        grade: gradeFilter || undefined,
        lesson: search.trim() || undefined,
      });
      setLeagues(result.leagues);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load leagues:", err);
      setError("دریافت لیگ‌ها انجام نشد");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, gradeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load(1);
  };

  // ==================== Actions ====================
  const handleEdit = (league: ArenaLeagueAdmin) => {
    setEditingLeague(league);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingLeague(null);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingLeague(null);
    void load(pagination.page);
  };

  const handleDelete = async (league: ArenaLeagueAdmin) => {
    if (
      !window.confirm(
        `آیا از حذف لیگ «${league.title}» مطمئن هستی؟ این عمل قابل بازگشت نیست.`,
      )
    ) {
      return;
    }

    setDeletingId(league.id);
    try {
      await deleteArenaLeague(league.id);
      setLeagues((current) => current.filter((l) => l.id !== league.id));
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "حذف لیگ انجام نشد";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (
    league: ArenaLeagueAdmin,
    status: "upcoming" | "active" | "finished",
  ) => {
    try {
      const result = await changeArenaLeagueStatus(league.id, status);
      setLeagues((current) =>
        current.map((l) => (l.id === league.id ? result.league : l)),
      );
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تغییر وضعیت انجام نشد";
      setError(message);
    }
  };

  // ==================== Stats ====================
  const stats = useMemo(() => {
    return {
      total: pagination.total,
      active: leagues.filter((l) => l.status === "active").length,
      upcoming: leagues.filter((l) => l.status === "upcoming").length,
      finished: leagues.filter((l) => l.status === "finished").length,
    };
  }, [leagues, pagination]);

  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به داشبورد
          </button>

          {/* HERO */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />

            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                  <Layers size={32} strokeWidth={2.3} />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Arena Management
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  مدیریت لیگ‌های آرنا
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  لیگ بساز، رشته‌های مجاز رو تعیین کن و وضعیت رو مدیریت کن
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="group relative shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={16} strokeWidth={2.5} />
                  لیگ جدید
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                  <AlertCircle size={16} className="text-rose-500" />
                </div>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400 whitespace-pre-line">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: Layers,
                label: "کل لیگ‌ها",
                value: stats.total,
                color: "text-gray-900 dark:text-white",
                bg: "bg-gray-500/10",
              },
              {
                icon: CheckCircle2,
                label: "فعال",
                value: stats.active,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Clock3,
                label: "در انتظار",
                value: stats.upcoming,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                icon: Trophy,
                label: "پایان‌یافته",
                value: stats.finished,
                color: "text-gray-500 dark:text-gray-400",
                bg: "bg-gray-500/10",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={16} className={stat.color} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p
                    className={`font-heading text-xl font-black mt-1 tabular-nums ${stat.color}`}
                  >
                    {stat.value.toLocaleString("fa-IR")}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Filters */}
          <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="p-4 border-b border-gray-200/70 dark:border-white/5 space-y-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجو در درس..."
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2.5 pr-10 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl transition-all"
                >
                  جستجو
                </button>
              </form>

              {/* Filter chips */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                  <Filter size={11} />
                  وضعیت:
                </div>

                {[
                  { key: "", label: "همه" },
                  { key: "upcoming", label: "در انتظار" },
                  { key: "active", label: "فعال" },
                  { key: "finished", label: "پایان‌یافته" },
                ].map((s) => {
                  const isActive = statusFilter === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setStatusFilter(s.key)}
                      className={`
                        rounded-lg px-2.5 py-1.5 text-[10px] font-black transition-all
                        ${
                          isActive
                            ? "bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] border border-[var(--griffin-gold)]/30"
                            : "border border-gray-200 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/30 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      {s.label}
                    </button>
                  );
                })}

                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

                <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                  پایه:
                </div>

                {[{ value: "", label: "همه" }, ...GRADES].map((g) => {
                  const isActive = gradeFilter === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGradeFilter(g.value)}
                      className={`
                        rounded-lg px-2.5 py-1.5 text-[10px] font-black transition-all
                        ${
                          isActive
                            ? "bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] border border-[var(--griffin-gold)]/30"
                            : "border border-gray-200 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/30 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      {g.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => void load(pagination.page)}
                  disabled={loading}
                  className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all disabled:opacity-40"
                >
                  <RefreshCw
                    size={11}
                    className={loading ? "animate-spin" : ""}
                  />
                  بروزرسانی
                </button>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoaderCircle
                  size={28}
                  className="text-[var(--griffin-gold)] animate-spin"
                />
              </div>
            ) : leagues.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <Layers
                    size={28}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                  لیگی پیدا نشد
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  یه لیگ جدید بساز یا فیلتر رو تغییر بده
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/70 dark:divide-white/5">
                {leagues.map((league) => {
                  const status =
                    STATUS_STYLES[league.status] ?? STATUS_STYLES.upcoming;
                  const StatusIcon = status.icon;
                  const isDeleting = deletingId === league.id;

                  return (
                    <div
                      key={league.id}
                      className={`
                        group p-4 transition-colors
                        hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.02]
                        ${isDeleting ? "opacity-50 pointer-events-none" : ""}
                      `}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-heading text-base font-black text-gray-900 dark:text-white truncate">
                              {league.title}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black ${status.bg} ${status.text}`}
                            >
                              <StatusIcon size={10} />
                              {STATUS_LABELS[league.status]}
                            </span>

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-600 dark:text-gray-400">
                              <Zap size={9} />
                              {league.lesson}
                            </span>

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] font-black text-blue-600 dark:text-blue-400">
                              پایه{" "}
                              {GRADES.find((g) => g.value === league.grade)
                                ?.label || league.grade}
                            </span>
                          </div>

                          {/* Majors */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-2">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              رشته‌های مجاز:
                            </span>
                            {league.compatibleMajors.length === 0 ? (
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                همه رشته‌ها
                              </span>
                            ) : (
                              league.compatibleMajors.map((m) => (
                                <span
                                  key={m}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-[10px] font-black text-purple-600 dark:text-purple-400"
                                >
                                  {MAJORS_LABELS[m] || m}
                                </span>
                              ))
                            )}
                          </div>

                          {/* Dates + Counts */}
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={10} />
                              {formatDate(league.startDate)} →{" "}
                              {formatDate(league.endDate)}
                            </span>

                            {league._count && (
                              <>
                                <span className="inline-flex items-center gap-1">
                                  <Trophy size={10} />
                                  {league._count.matches.toLocaleString(
                                    "fa-IR",
                                  )}{" "}
                                  نبرد
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Users size={10} />
                                  {league._count.ratings.toLocaleString(
                                    "fa-IR",
                                  )}{" "}
                                  بازیکن
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex flex-wrap items-center gap-2">
                          {/* Status change */}
                          <select
                            value={league.status}
                            onChange={(e) =>
                              void handleStatusChange(
                                league,
                                e.target.value as
                                  | "upcoming"
                                  | "active"
                                  | "finished",
                              )
                            }
                            disabled={league.status === "finished"}
                            className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-2.5 py-1.5 text-[10px] font-black text-gray-700 dark:text-gray-300 outline-none focus:border-[var(--griffin-gold)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="upcoming">در انتظار</option>
                            <option value="active">فعال</option>
                            <option value="finished">پایان‌یافته</option>
                          </select>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleEdit(league)}
                            disabled={
                              isDeleting || league.status === "finished"
                            }
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/15 hover:text-[var(--griffin-gold)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all"
                            title="ویرایش"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => void handleDelete(league)}
                            disabled={isDeleting}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 disabled:opacity-50 transition-all"
                            title="حذف"
                          >
                            {isDeleting ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-white/5">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                  {pagination.totalPages.toLocaleString("fa-IR")}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => void load(pagination.page - 1)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    قبلی
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => void load(pagination.page + 1)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Form Modal */}
      {formOpen && (
        <LeagueFormModal
          league={editingLeague}
          onClose={() => {
            setFormOpen(false);
            setEditingLeague(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
};

export default ArenaLeagues;
