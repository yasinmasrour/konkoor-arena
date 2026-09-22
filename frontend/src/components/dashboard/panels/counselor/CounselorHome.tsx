import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Flame,
  GraduationCap,
  LoaderCircle,
  Search,
  Sparkles,
  Target,
  Trophy,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";

interface CounselorStats {
  students: {
    total: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  performance: {
    averageScore: number;
    totalAttempts: number;
    attemptsLast7Days: number;
  };
}

interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string | null;
  grade: string | null;
  major: string | null;
  isVerified: boolean;
  attemptsCount: number;
  createdAt: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fa-IR", { dateStyle: "medium" });

const CounselorHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadStudents = async (searchTerm = "") => {
    try {
      const res = await api.get("/counselor/students", {
        params: { limit: 10, search: searchTerm.trim() || undefined },
      });
      setStudents(res.data.students);
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [statsRes, studentsRes] = await Promise.all([
          api.get("/counselor/stats"),
          api.get("/counselor/students", { params: { limit: 10 } }),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setStudents(studentsRes.data.students);
      } catch (err) {
        console.error("Failed to load counselor data:", err);
        if (!cancelled) setError("دریافت اطلاعات انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void loadStudents(search);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت اطلاعات...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
        <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
          {error || "اطلاعات پیدا نشد"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ==================== HERO ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-600/25 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative shrink-0 self-center lg:self-auto">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-70 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
              <GraduationCap size={36} strokeWidth={2.3} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white border-2 border-[#080B12] shadow-lg">
              <Sparkles size={14} />
            </span>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Counselor Dashboard
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              خوش آمدی، مشاور!
            </h1>

            <p className="mt-2 text-sm text-gray-400 leading-7">
              وضعیت دانش‌آموزان رو دنبال کن و راهنماییشون کن
            </p>
          </div>
        </div>
      </section>

      {/* ==================== کارت‌های آماری ==================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Users,
            label: "کل دانش‌آموزان",
            value: stats.students.total,
            sub: `${stats.students.newLast7Days} جدید این هفته`,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            icon: UserCheck,
            label: "کاربران جدید",
            value: stats.students.newLast30Days,
            sub: "۳۰ روز اخیر",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: BarChart3,
            label: "میانگین نمره",
            value: `${stats.performance.averageScore}٪`,
            sub: "از کل تلاش‌ها",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            icon: Trophy,
            label: "کل تلاش‌ها",
            value: stats.performance.totalAttempts,
            sub: `${stats.performance.attemptsLast7Days} این هفته`,
            color: "text-[var(--griffin-gold)]",
            bg: "bg-[var(--griffin-gold)]/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={18} className={stat.color} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p
                className={`font-heading text-xl font-black mt-1 tabular-nums ${stat.color}`}
              >
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("fa-IR")
                  : stat.value}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </section>

      {/* ==================== دسترسی سریع ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="inline-flex items-center gap-2">
            <Flame size={13} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Quick Actions
            </span>
          </div>
          <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
            دسترسی سریع
          </h2>
        </div>

        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              label: "لیست دانش‌آموزان",
              desc: "مشاهده و مدیریت",
              href: "/dashboard?section=students",
              color: "from-blue-500 to-blue-700",
            },
            {
              icon: BookOpen,
              label: "آزمون‌ها",
              desc: "مرور آزمون‌ها",
              href: "/dashboard?section=exams",
              color: "from-purple-500 to-purple-700",
            },
            {
              icon: Trophy,
              label: "آرنا",
              desc: "نتایج نبردها",
              href: "/arena",
              color: "from-[var(--griffin-gold)] to-amber-700",
            },
            {
              icon: Target,
              label: "برنامه‌های مطالعاتی",
              desc: "مدیریت برنامه‌ها",
              href: "/dashboard/counselor/students",
              color: "from-rose-500 to-rose-700",
            },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => navigate(action.href)}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowLeft
                    size={14}
                    className="text-gray-400 dark:text-gray-600 transition-transform group-hover:-translate-x-1 group-hover:text-[var(--griffin-gold)] rotate-180 shrink-0 mt-1"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== لیست دانش‌آموزان ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="inline-flex items-center gap-2">
            <Users size={13} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Students
            </span>
          </div>
          <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
            دانش‌آموزان
          </h2>
        </div>

        <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در نام، نام کاربری یا شماره..."
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
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Users size={28} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              دانش‌آموزی پیدا نشد
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/70 dark:divide-white/5">
            {students.map((student) => (
              <div
                key={student.id}
                className="group p-4 hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-heading font-black text-base shadow-lg">
                      {student.firstName?.charAt(0) || "?"}
                    </div>
                    {student.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#080B12] flex items-center justify-center">
                        <BadgeCheck size={10} className="text-white" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      {student.username && (
                        <span className="font-english">
                          @{student.username}
                        </span>
                      )}
                      {student.phoneNumber && (
                        <span dir="ltr" className="font-english tabular-nums">
                          {student.phoneNumber}
                        </span>
                      )}
                      <span>{formatDate(student.createdAt)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-center">
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">
                      تلاش‌ها
                    </p>
                    <p className="font-heading text-sm font-black text-purple-600 dark:text-purple-400 tabular-nums">
                      {student.attemptsCount.toLocaleString("fa-IR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CounselorHome;
