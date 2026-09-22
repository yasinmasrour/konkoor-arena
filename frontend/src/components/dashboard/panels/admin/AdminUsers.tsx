import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Filter,
  LoaderCircle,
  Search,
  Shield,
  Sparkles,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import api from "../../../../api/axios";

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string | null;
  email: string | null;
  isVerified: boolean;
  role: string;
  balance: number;
  attemptsCount: number;
  arenaMatchesCount: number;
  subscriptionsCount: number;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "مدیر",
  QUESTION_DESIGNER: "طراح سؤال",
  COUNSELOR: "مشاور",
  STUDENT: "دانش‌آموز",
};

const roleColors: Record<string, { bg: string; text: string }> = {
  ADMIN: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
  },
  QUESTION_DESIGNER: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
  COUNSELOR: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  STUDENT: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

const formatPrice = (amountInRial: number) => {
  const toman = Math.floor(amountInRial / 10);
  return new Intl.NumberFormat("fa-IR").format(toman);
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fa-IR", {
    dateStyle: "medium",
  });

const AdminUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/users", {
        params: {
          page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          role: roleFilter || undefined,
        },
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("دریافت کاربران انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load(1);
  };

  const stats = useMemo(() => {
    return {
      total: pagination.total,
      onPage: users.length,
    };
  }, [pagination, users]);

  return (
    <div className="space-y-5">
      {/* ==================== HERO ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative shrink-0 self-center sm:self-auto">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
              <Users size={28} strokeWidth={2.3} />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 mb-1.5">
              <Sparkles
                size={11}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                User Management
              </span>
            </div>

            <h1 className="font-heading text-2xl font-black text-white">
              مدیریت کاربران
            </h1>

            <p className="mt-1.5 text-sm text-gray-400">
              {stats.total.toLocaleString("fa-IR")} کاربر در سیستم
            </p>
          </div>
        </div>
      </section>

      {/* ==================== Filters ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2 mb-3"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در نام، نام کاربری، شماره یا ایمیل..."
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

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
              <Filter size={11} />
              نقش:
            </div>

            {[
              { key: "", label: "همه" },
              { key: "STUDENT", label: "دانش‌آموز" },
              { key: "ADMIN", label: "مدیر" },
              { key: "QUESTION_DESIGNER", label: "طراح سؤال" },
              { key: "COUNSELOR", label: "مشاور" },
            ].map((r) => {
              const isActive = roleFilter === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRoleFilter(r.key)}
                  className={`
                    rounded-lg px-2.5 py-1.5 text-[10px] font-black transition-all
                    ${
                      isActive
                        ? "bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] border border-[var(--griffin-gold)]/30"
                        : "border border-gray-200 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/30 hover:text-[var(--griffin-gold)]"
                    }
                  `}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== لیست کاربران ==================== */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoaderCircle
              size={28}
              className="text-[var(--griffin-gold)] animate-spin"
            />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={24} className="mx-auto text-rose-500 mb-3" />
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
              {error}
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Users size={28} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              کاربری پیدا نشد
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/70 dark:divide-white/5">
            {users.map((user) => {
              const roleStyle = roleColors[user.role] || roleColors.STUDENT;

              return (
                <div
                  key={user.id}
                  className="group p-4 hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* آواتار */}
                    <div className="relative shrink-0 self-start sm:self-auto">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-base shadow-lg">
                        {user.firstName?.charAt(0) || "?"}
                      </div>
                      {user.isVerified && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#080B12] flex items-center justify-center">
                          <BadgeCheck size={10} className="text-white" />
                        </span>
                      )}
                    </div>

                    {/* اطلاعات */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black ${roleStyle.bg} ${roleStyle.text}`}
                        >
                          {user.role === "ADMIN" && <Shield size={8} />}
                          {user.role === "QUESTION_DESIGNER" && (
                            <Sparkles size={8} />
                          )}
                          {user.role === "COUNSELOR" && <UserCheck size={8} />}
                          {user.role === "STUDENT" && <User size={8} />}
                          {roleLabels[user.role] || user.role}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                        {user.username && (
                          <span className="font-english">@{user.username}</span>
                        )}
                        {user.phoneNumber && (
                          <span dir="ltr" className="font-english tabular-nums">
                            {user.phoneNumber}
                          </span>
                        )}
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </div>

                    {/* آمار کوچیک */}
                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-[9px] text-gray-500 dark:text-gray-400">
                          کیف پول
                        </p>
                        <p className="font-heading text-xs font-black text-[var(--griffin-gold)] tabular-nums">
                          {formatPrice(user.balance)} ت
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-gray-500 dark:text-gray-400">
                          آزمون
                        </p>
                        <p className="font-heading text-xs font-black text-purple-600 dark:text-purple-400 tabular-nums">
                          {user.attemptsCount.toLocaleString("fa-IR")}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-gray-500 dark:text-gray-400">
                          آرنا
                        </p>
                        <p className="font-heading text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {user.arenaMatchesCount.toLocaleString("fa-IR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== Pagination ==================== */}
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
                disabled={pagination.page >= pagination.totalPages || loading}
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
  );
};

export default AdminUsers;
