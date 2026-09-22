import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  GraduationCap,
  Layers,
  LoaderCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import {
  createArenaLeague,
  updateArenaLeague,
  type ArenaLeagueAdmin,
  type CreateLeaguePayload,
  type UpdateLeaguePayload,
} from "../../../api/adminArenaApi";

interface LeagueFormModalProps {
  league?: ArenaLeagueAdmin | null;
  onClose: () => void;
  onSuccess: () => void;
}

const GRADES = [
  { value: "10", label: "دهم" },
  { value: "11", label: "یازدهم" },
  { value: "12", label: "دوازدهم" },
];

const MAJORS = [
  { value: "math", label: "ریاضی" },
  { value: "experimental", label: "تجربی" },
  { value: "humanities", label: "انسانی" },
];

const STATUSES = [
  { value: "upcoming", label: "در انتظار" },
  { value: "active", label: "فعال" },
  { value: "finished", label: "پایان‌یافته" },
];

// 🔹 تبدیل ISO به datetime-local format
const toDateTimeLocal = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

// 🔹 تبدیل datetime-local به ISO
const toISO = (local: string) => {
  if (!local) return "";
  return new Date(local).toISOString();
};

const LeagueFormModal = ({
  league,
  onClose,
  onSuccess,
}: LeagueFormModalProps) => {
  const editing = Boolean(league);

  const [form, setForm] = useState({
    title: league?.title || "",
    lesson: league?.lesson || "",
    grade: league?.grade || "10",
    compatibleMajors: league?.compatibleMajors || [],
    startDate: toDateTimeLocal(league?.startDate),
    endDate: toDateTimeLocal(league?.endDate),
    status: league?.status || "upcoming",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 toggle major
  const toggleMajor = (value: string) => {
    setForm((current) => ({
      ...current,
      compatibleMajors: current.compatibleMajors.includes(value)
        ? current.compatibleMajors.filter((m) => m !== value)
        : [...current.compatibleMajors, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 🔹 validation دستی
    if (form.title.trim().length < 2) {
      setError("عنوان باید حداقل ۲ کاراکتر باشد");
      return;
    }
    if (form.lesson.trim().length < 2) {
      setError("درس باید حداقل ۲ کاراکتر باشد");
      return;
    }
    if (!form.startDate) {
      setError("تاریخ شروع الزامی است");
      return;
    }
    if (!form.endDate) {
      setError("تاریخ پایان الزامی است");
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("تاریخ پایان باید بعد از تاریخ شروع باشد");
      return;
    }

    setSaving(true);

    try {
      if (editing && league) {
        const payload: UpdateLeaguePayload = {
          title: form.title.trim(),
          lesson: form.lesson.trim(),
          grade: form.grade,
          compatibleMajors: form.compatibleMajors,
          startDate: toISO(form.startDate),
          endDate: toISO(form.endDate),
          status: form.status,
        };
        await updateArenaLeague(league.id, payload);
      } else {
        const payload: CreateLeaguePayload = {
          title: form.title.trim(),
          lesson: form.lesson.trim(),
          grade: form.grade,
          compatibleMajors: form.compatibleMajors,
          startDate: toISO(form.startDate),
          endDate: toISO(form.endDate),
          status: form.status,
        };
        await createArenaLeague(payload);
      }

      onSuccess();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره لیگ انجام نشد";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <Layers size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                {editing ? "Edit League" : "New League"}
              </p>
              <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                {editing ? "ویرایش لیگ" : "ساخت لیگ جدید"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
              <AlertCircle
                size={15}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-5">
                {error}
              </p>
            </div>
          )}

          {/* Title + Lesson */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                عنوان لیگ *
              </span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((c) => ({ ...c, title: e.target.value }))
                }
                placeholder="مثلاً ریاضی۱"
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />
            </label>

            <label className="block">
              <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                درس *
              </span>
              <input
                value={form.lesson}
                onChange={(e) =>
                  setForm((c) => ({ ...c, lesson: e.target.value }))
                }
                placeholder="مثلاً ریاضی"
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />
            </label>
          </div>

          {/* Grade + Status */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <GraduationCap size={11} />
                پایه *
              </span>
              <select
                value={form.grade}
                onChange={(e) =>
                  setForm((c) => ({ ...c, grade: e.target.value }))
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              >
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                وضعیت
              </span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((c) => ({
                    ...c,
                    status: e.target.value as
                      | "upcoming"
                      | "active"
                      | "finished",
                  }))
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Majors */}
          <div>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              <Sparkles size={11} />
              رشته‌های مجاز
            </span>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3 leading-5">
              اگه هیچ رشته‌ای انتخاب نکنی، لیگ برای <strong>همه رشته‌ها</strong>{" "}
              نمایش داده می‌شه.
            </p>

            <div className="flex flex-wrap gap-2">
              {MAJORS.map((m) => {
                const isSelected = form.compatibleMajors.includes(m.value);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggleMajor(m.value)}
                    disabled={saving}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-4 py-2.5
                      text-xs font-black transition-all
                      ${
                        isSelected
                          ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                          : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <Calendar size={11} />
                تاریخ شروع *
              </span>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm((c) => ({ ...c, startDate: e.target.value }))
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <Calendar size={11} />
                تاریخ پایان *
              </span>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) =>
                  setForm((c) => ({ ...c, endDate: e.target.value }))
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="relative p-5 border-t border-gray-200/70 dark:border-white/5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {saving ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {editing ? "ذخیره تغییرات" : "ساخت لیگ"}
                </>
              )}
            </span>
            {!saving && (
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeagueFormModal;
