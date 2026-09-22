import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Eye,
  LoaderCircle,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import RevealOnScroll from "../../components/common/RevealOnScroll";

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

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

const majorLabels: Record<string, string> = {
  math: "ریاضی",
  experimental: "تجربی",
  humanities: "انسانی",
};

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // ==================== Load ====================
  const load = async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/counselor/students", {
        params: {
          page,
          limit: pagination.limit,
          search: searchTerm.trim() || undefined,
        },
      });
      setStudents(res.data.students);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError("دریافت لیست دانش‌آموزان انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load(1, search);
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
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

        {/* Hero */}
        <RevealOnScroll>
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-600/25 blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                  <Users size={32} strokeWidth={2.3} />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Students
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  دانش‌آموزان
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  {pagination.total > 0
                    ? `${pagination.total.toLocaleString("fa-IR")} دانش‌آموز`
                    : "لیست دانش‌آموزان"}
                </p>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* Search */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
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

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-3">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <LoaderCircle
                      size={24}
                      className="text-white animate-spin"
                    />
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  در حال دریافت...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle size={28} className="mx-auto text-rose-500 mb-3" />
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Users size={28} className="text-gray-400 dark:text-gray-600" />
              </div>
              <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                دانش‌آموزی پیدا نشد
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/70 dark:divide-white/5">
              {students.map((student, i) => (
                <RevealOnScroll key={student.id} delay={i * 30}>
                  <StudentRow
                    student={student}
                    onView={() =>
                      navigate(`/dashboard/counselor/students/${student.id}`)
                    }
                  />
                </RevealOnScroll>
              ))}
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
                  onClick={() => void load(pagination.page - 1, search)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all text-[10px] font-black"
                >
                  قبلی
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => void load(pagination.page + 1, search)}
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
  );
};

// ==================== StudentRow ====================
interface StudentRowProps {
  student: StudentItem;
  onView: () => void;
}

const StudentRow = ({ student, onView }: StudentRowProps) => {
  return (
    <button
      type="button"
      onClick={onView}
      className="group w-full text-right p-4 hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-heading font-black text-base shadow-lg">
            {student.firstName?.charAt(0) || "?"}
          </div>
          {student.isVerified && (
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#080B12] flex items-center justify-center">
              <BadgeCheck size={10} className="text-white" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
            {student.firstName} {student.lastName}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            {student.username && (
              <span className="font-english">@{student.username}</span>
            )}
            {student.phoneNumber && (
              <span dir="ltr" className="font-english tabular-nums">
                {student.phoneNumber}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar size={9} />
              {formatDate(student.createdAt)}
            </span>
          </div>

          {/* Tags */}
          {(student.grade || student.major) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {student.grade && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-black">
                  {gradeLabels[student.grade] ?? student.grade}
                </span>
              )}
              {student.major && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black">
                  {majorLabels[student.major] ?? student.major}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="text-center">
            <p className="text-[9px] text-gray-500 dark:text-gray-400">
              تلاش‌ها
            </p>
            <p className="font-heading text-sm font-black text-purple-600 dark:text-purple-400 tabular-nums">
              {student.attemptsCount.toLocaleString("fa-IR")}
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-[var(--griffin-gold)]/15 group-hover:text-[var(--griffin-gold)] transition-all">
            <Eye size={15} />
          </div>
        </div>
      </div>
    </button>
  );
};

export default StudentsList;
