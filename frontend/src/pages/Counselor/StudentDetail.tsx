import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  FileQuestion,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  listPlans,
  formatPlanDate,
  getProgressPercent,
  STATUS_COLORS,
  STATUS_LABELS,
  type StudyPlan,
} from "../../api/studyPlanApi";

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string | null;
  email: string | null;
  grade: string | null;
  major: string | null;
  city: string | null;
  province: string | null;
  isVerified: boolean;
  attemptsCount: number;
  createdAt: string;
}

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

// const formatDate = (value: string | null) => {
//   if (!value) return "—";
//   return new Date(value).toLocaleDateString("fa-IR", { dateStyle: "medium" });
// };

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== Load ====================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [studentRes, plansRes] = await Promise.all([
          api.get(`/counselor/students/${id}`),
          listPlans({ studentId: id, limit: 50 }),
        ]);
        setStudent(studentRes.data.student);
        setPlans(plansRes.plans);
      } catch (err) {
        console.error("Failed to load student:", err);
        setError("دریافت اطلاعات دانش‌آموز انجام نشد.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
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
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !student) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "دانش‌آموز پیدا نشد"}
          </p>
          <button
            onClick={() => navigate("/dashboard/counselor/students")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/counselor/students")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به لیست
        </button>

        {/* Student Info */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-600/25 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <span className="font-heading text-3xl font-black">
                  {student.firstName.charAt(0)}
                </span>
              </div>
              {student.isVerified && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-500 border-2 border-[#080B12] flex items-center justify-center shadow-lg">
                  <BadgeCheck size={14} className="text-white" />
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-right min-w-0">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles
                  size={12}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Student Profile
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white truncate">
                {student.firstName} {student.lastName}
              </h1>

              <div className="mt-3 flex items-center gap-3 flex-wrap justify-center sm:justify-start text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1.5 font-english">
                  @{student.username}
                </span>
                {student.phoneNumber && (
                  <span
                    className="inline-flex items-center gap-1.5 font-english"
                    dir="ltr"
                  >
                    <Phone size={11} />
                    {student.phoneNumber}
                  </span>
                )}
                {student.email && (
                  <span className="inline-flex items-center gap-1.5 font-english">
                    <Mail size={11} />
                    {student.email}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {student.grade && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 text-[10px] font-black">
                    {gradeLabels[student.grade] ?? student.grade}
                  </span>
                )}
                {student.major && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 text-[10px] font-black">
                    {majorLabels[student.major] ?? student.major}
                  </span>
                )}
                {(student.city || student.province) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 text-[10px] font-black">
                    <MapPin size={9} />
                    {student.city || student.province}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 self-center sm:self-auto">
              <button
                onClick={() =>
                  navigate(
                    `/dashboard/counselor/students/${student.id}/plans/new`,
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Plus size={14} />
                برنامه جدید
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          {[
            {
              icon: FileQuestion,
              label: "تلاش‌ها",
              value: student.attemptsCount,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              icon: Target,
              label: "برنامه‌ها",
              value: plans.length,
              color: "text-[var(--griffin-gold)]",
              bg: "bg-[var(--griffin-gold)]/10",
            },
            {
              icon: CheckCircle2,
              label: "برنامه‌های تکمیل‌شده",
              value: plans.filter((p) => p.status === "completed").length,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 text-center"
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                >
                  <Icon size={18} className={stat.color} />
                </div>
                <p
                  className={`font-heading text-2xl font-black tabular-nums ${stat.color}`}
                >
                  {stat.value.toLocaleString("fa-IR")}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* Plans */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Study Plans
                </p>
                <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                  برنامه‌های مطالعاتی
                </h2>
              </div>
            </div>
          </div>

          {plans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Target
                  size={28}
                  className="text-gray-400 dark:text-gray-600"
                />
              </div>
              <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400 mb-4">
                هنوز برنامه‌ای برای این دانش‌آموز ساخته نشده
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/dashboard/counselor/students/${student.id}/plans/new`,
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
              >
                <Plus size={13} />
                ساخت برنامه جدید
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {plans.map((plan) => (
                <PlanMiniCard
                  key={plan.id}
                  plan={plan}
                  onView={() =>
                    navigate(`/dashboard/counselor/plans/${plan.id}/edit`)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

// ==================== PlanMiniCard ====================
interface PlanMiniCardProps {
  plan: StudyPlan;
  onView: () => void;
}

const PlanMiniCard = ({ plan, onView }: PlanMiniCardProps) => {
  const progress = getProgressPercent(plan);
  const statusStyle = STATUS_COLORS[plan.status];

  return (
    <button
      type="button"
      onClick={onView}
      className="group w-full text-right rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4 hover:border-[var(--griffin-gold)]/40 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black ${statusStyle.bg} ${statusStyle.text}`}
            >
              {STATUS_LABELS[plan.status]}
            </span>
            {plan.exam && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                <FileQuestion size={9} />
                {plan.exam.title}
              </span>
            )}
          </div>

          <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
            {plan.title}
          </h3>

          <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Calendar size={9} />
              {formatPlanDate(plan.startDate)}
            </span>
            {plan.endDate && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock3 size={9} />
                {formatPlanDate(plan.endDate)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 size={9} />
              {plan.completedTasks.toLocaleString("fa-IR")} /{" "}
              {plan.totalTasks.toLocaleString("fa-IR")}
            </span>
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="shrink-0 w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-[var(--griffin-gold)]/15 group-hover:text-[var(--griffin-gold)] transition-all">
          <Eye size={14} />
        </div>
      </div>
    </button>
  );
};

export default StudentDetail;
