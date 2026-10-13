import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Save,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import DateWheelPickerModal, {
  formatJalaliDisplay,
} from "../ui/DateWheelPickerModal";

interface ProfileForm {
  birthDate: string;
  major: string;
  grade: string;
  email: string;
  nationalId: string;
  address: string;
  city: string;
  province: string;
}

const majorLabels: Record<string, string> = {
  math: "ریاضی",
  experimental: "تجربی",
  humanities: "انسانی",
};

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

// ==================== Helper: ISO (UTC) → Local "YYYY-MM-DD" ====================
function toLocalDateString(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const ProfileCompletionCard = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const [form, setForm] = useState<ProfileForm>({
    birthDate: "",
    major: "",
    grade: "",
    email: "",
    nationalId: "",
    address: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    void getMyProfile()
      .then((profile) => {
        updateUser(profile);
        setForm({
          // ✅ تبدیل ISO به local date
          birthDate: profile.birthDate
            ? toLocalDateString(profile.birthDate)
            : "",
          major: profile.major || "",
          grade: profile.grade || "",
          email: profile.email || "",
          nationalId: profile.nationalId || "",
          address: profile.address || "",
          city: profile.city || "",
          province: profile.province || "",
        });
      })
      .catch(() => undefined);
  }, []);

  const complete = useMemo(
    () => Boolean(user?.birthDate && user?.major && user?.grade),
    [user],
  );

  const setField = <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!form.birthDate) {
      setMessageType("error");
      setMessage("لطفاً تاریخ تولد را انتخاب کنید.");
      return;
    }
    setLoading(true);
    try {
      // ✅ birthDate رو به ISO با زمان محلی تبدیل کن
      const payload = {
        ...form,
        birthDate: form.birthDate
          ? new Date(form.birthDate + "T00:00:00").toISOString()
          : null,
      };

      const profile = await updateMyProfile(payload);
      updateUser(profile);
      setEditing(false);
      setMessageType("success");
      setMessage("اطلاعات پروفایل با موفقیت ذخیره شد.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setMessageType("error");
      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          "ذخیره اطلاعات انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      <div className="relative p-5 sm:p-6">
        {/* ==================== هدر ==================== */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-50" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <UserRound size={20} strokeWidth={2.3} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2">
                <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Profile
                </span>
              </div>
              <h2 className="font-heading text-base sm:text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                {complete ? "ویرایش اطلاعات" : "تکمیل پروفایل"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-6">
                {complete
                  ? "اطلاعات شخصی و تحصیلی خود را مدیریت کنید."
                  : "برای استفاده بهتر از امکانات گریفین، اطلاعات اصلی خود را تکمیل کنید."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className={`
              group shrink-0 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black transition-all
              ${
                editing
                  ? "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:border-rose-500/40 hover:text-rose-500"
                  : "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:-translate-y-0.5"
              }
            `}
          >
            {editing ? (
              <>
                <X size={14} />
                بستن
              </>
            ) : (
              <>
                <Pencil size={14} />
                ویرایش
              </>
            )}
          </button>
        </div>

        {/* ==================== پیام ==================== */}
        {message && (
          <div
            className={`
              mb-5 rounded-xl border p-3 flex items-center gap-2.5
              ${
                messageType === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-rose-500/30 bg-rose-500/10"
              }
            `}
          >
            {messageType === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
            )}
            <p
              className={`text-xs font-bold ${
                messageType === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {message}
            </p>
          </div>
        )}

        {/* ==================== فرم ==================== */}
        {editing && (
          <form
            onSubmit={save}
            className="grid gap-4 sm:grid-cols-2 animate-[fadeInUp_0.3s_ease-out]"
          >
            <Field
              label="تاریخ تولد"
              icon={UserRound}
              required
              type="date"
              value={form.birthDate}
              onChange={(v) => setField("birthDate", v)}
            />

            <label className="block">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <GraduationCap size={11} />
                رشته <span className="text-rose-500">*</span>
              </span>
              <select
                required
                value={form.major}
                onChange={(e) => setField("major", e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              >
                <option value="">انتخاب کنید</option>
                {Object.entries(majorLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <GraduationCap size={11} />
                پایه <span className="text-rose-500">*</span>
              </span>
              <select
                required
                value={form.grade}
                onChange={(e) => setField("grade", e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              >
                <option value="">انتخاب کنید</option>
                {Object.entries(gradeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="ایمیل"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(v) => setField("email", v)}
            />

            <Field
              label="کد ملی"
              icon={UserRound}
              value={form.nationalId}
              onChange={(v) => setField("nationalId", v)}
            />

            <Field
              label="شهر"
              icon={MapPin}
              value={form.city}
              onChange={(v) => setField("city", v)}
            />

            <Field
              label="استان"
              icon={MapPin}
              value={form.province}
              onChange={(v) => setField("province", v)}
            />

            <div className="sm:col-span-2">
              <Field
                label="آدرس"
                icon={MapPin}
                value={form.address}
                onChange={(v) => setField("address", v)}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group relative sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    ذخیره اطلاعات
                  </>
                )}
              </span>
              {!loading && (
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

// ==================== Field ====================
interface FieldProps {
  label: string;
  icon: typeof UserRound;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

const Field = ({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  required = false,
}: FieldProps) => (
  <label className="block">
    <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
      <Icon size={11} />
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    {type === "date" ? (
      // ✅ DateWheelPickerModal جایگزین JalaliDatePicker
      <DateWheelPickerModal
        value={value}
        onChange={onChange}
        required={required}
        aria-label={label}
      />
    ) : (
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
      />
    )}
  </label>
);

export default ProfileCompletionCard;
