import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import SecurityRecoverySection from "./SecurityRecoverySection";
import DateWheelPickerModal, {
  formatJalaliDisplay,
} from "../../ui/DateWheelPickerModal";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  major: string;
  grade: string;
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

const ProfilePanel = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // تغییر رمز
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [form, setForm] = useState<ProfileForm>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    birthDate: user?.birthDate ? toLocalDateString(user.birthDate) : "",
    major: user?.major ?? "math",
    grade: user?.grade ?? "12",
    nationalId: user?.nationalId ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    province: user?.province ?? "",
  });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        birthDate: user.birthDate ? toLocalDateString(user.birthDate) : "",
        major: user.major ?? "math",
        grade: user.grade ?? "12",
        nationalId: user.nationalId ?? "",
        address: user.address ?? "",
        city: user.city ?? "",
        province: user.province ?? "",
      });
    }
  }, [user]);

  const setField = <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("نام و نام خانوادگی الزامی است.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // ✅ birthDate رو به ISO با زمان محلی تبدیل کن
      const payload = {
        ...form,
        birthDate: form.birthDate
          ? new Date(form.birthDate + "T00:00:00").toISOString()
          : null,
      };

      const response = await api.patch("/users/me", payload);
      if (response.data?.user) {
        updateUser(response.data.user);
      }
      setSuccess("پروفایل با موفقیت به‌روزرسانی شد.");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "به‌روزرسانی پروفایل انجام نشد.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        birthDate: user.birthDate ? toLocalDateString(user.birthDate) : "",
        major: user.major ?? "math",
        grade: user.grade ?? "12",
        nationalId: user.nationalId ?? "",
        address: user.address ?? "",
        city: user.city ?? "",
        province: user.province ?? "",
      });
    }
    setEditing(false);
    setError("");
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError("رمز عبور فعلی را وارد کنید.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("رمز عبور جدید باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("تکرار رمز عبور مطابقت ندارد.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.post("/users/me/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("رمز عبور با موفقیت تغییر کرد.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setPasswordSuccess("");
        setShowPasswordSection(false);
      }, 3000);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تغییر رمز عبور انجام نشد.";
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const roleLabel =
    user?.role?.name === "ADMIN"
      ? "مدیر سیستم"
      : user?.role?.name === "QUESTION_DESIGNER"
        ? "طراح سؤال"
        : user?.role?.name === "COUNSELOR"
          ? "مشاور"
          : "دانش‌آموز";

  return (
    <div className="space-y-5">
      {/* ==================== HERO ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/10 backdrop-blur-xl p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          {/* آواتار */}
          <div className="relative shrink-0 self-center sm:self-auto">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-4xl shadow-2xl rotate-3">
              {user?.firstName?.charAt(0) || "?"}
            </div>
            <div className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--griffin-gold)] text-white text-[9px] font-black shadow-lg">
              <Sparkles size={9} />
              {roleLabel}
            </div>
          </div>

          {/* اطلاعات */}
          <div className="flex-1 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                پروفایل کاربری
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h1>

            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-500/10 dark:bg-white/5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                <User size={10} />@{user?.username}
              </span>
              {user?.phoneNumber && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-500/10 dark:bg-white/5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  <Phone size={10} />
                  {user.phoneNumber}
                </span>
              )}
              {user?.email && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-500/10 dark:bg-white/5 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  <Mail size={10} />
                  {user.email}
                </span>
              )}
            </div>
          </div>

          {/* دکمه‌ها */}
          <div className="shrink-0 self-center sm:self-auto">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all"
              >
                <User size={14} />
                ویرایش پروفایل
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-xs font-black text-gray-600 dark:text-gray-300 hover:border-rose-500/40 hover:text-rose-500 transition-all disabled:opacity-50"
                >
                  <X size={14} />
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== پیام‌ها ==================== */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <p className="text-xs font-bold text-rose-500 dark:text-rose-400">
            {error}
          </p>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400">
            {success}
          </p>
        </div>
      )}

      {/* ==================== اطلاعات شخصی ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
              <User size={15} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Personal Info
              </p>
              <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                اطلاعات شخصی
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="نام"
              icon={User}
              value={form.firstName}
              onChange={(v) => setField("firstName", v)}
              editing={editing}
            />
            <Field
              label="نام خانوادگی"
              icon={User}
              value={form.lastName}
              onChange={(v) => setField("lastName", v)}
              editing={editing}
            />
            <Field
              label="ایمیل"
              icon={Mail}
              value={form.email}
              onChange={(v) => setField("email", v)}
              editing={editing}
              type="email"
            />
            <Field
              label="شماره موبایل"
              icon={Phone}
              value={form.phoneNumber}
              onChange={(v) => setField("phoneNumber", v)}
              editing={false}
              note="برای تغییر، از بخش امنیت استفاده کن"
            />
            <Field
              label="تاریخ تولد"
              icon={Calendar}
              value={form.birthDate}
              onChange={(v) => setField("birthDate", v)}
              editing={editing}
              type="date"
            />
            <Field
              label="کد ملی"
              icon={Award}
              value={form.nationalId}
              onChange={(v) => setField("nationalId", v)}
              editing={editing}
            />
          </div>
        </div>
      </section>

      {/* ==================== اطلاعات تحصیلی ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <GraduationCap size={15} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Academic Info
              </p>
              <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                اطلاعات تحصیلی
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                رشته
              </label>
              {editing ? (
                <select
                  value={form.major}
                  onChange={(e) => setField("major", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                >
                  {Object.entries(majorLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white">
                  {majorLabels[form.major] ?? form.major}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                پایه
              </label>
              {editing ? (
                <select
                  value={form.grade}
                  onChange={(e) => setField("grade", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                >
                  {Object.entries(gradeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white">
                  {gradeLabels[form.grade] ?? form.grade}
                </div>
              )}
            </div>

            <Field
              label="استان"
              icon={MapPin}
              value={form.province}
              onChange={(v) => setField("province", v)}
              editing={editing}
            />
            <Field
              label="شهر"
              icon={MapPin}
              value={form.city}
              onChange={(v) => setField("city", v)}
              editing={editing}
            />

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                آدرس
              </label>
              {editing ? (
                <textarea
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                />
              ) : (
                <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white min-h-[42px]">
                  {form.address || "—"}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== امنیت ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

        <div className="relative p-5">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Shield size={15} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Security
                </p>
                <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                  امنیت حساب
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 text-xs font-black text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all"
            >
              <Lock size={13} />
              {showPasswordSection ? "بستن" : "تغییر رمز عبور"}
            </button>
          </div>

          {showPasswordSection && (
            <div className="space-y-3 pt-3 border-t border-gray-200/70 dark:border-white/5">
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="رمز عبور فعلی"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 pl-10 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 pl-10 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="تکرار رمز عبور جدید"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              />

              {passwordError && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-500 shrink-0" />
                  <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400">
                    {passwordError}
                  </p>
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500 shrink-0"
                  />
                  <p className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400">
                    {passwordSuccess}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handlePasswordChange()}
                disabled={passwordSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {passwordSaving ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {passwordSaving ? "در حال تغییر..." : "تغییر رمز عبور"}
              </button>
            </div>
          )}
        </div>
      </section>
      {/* ==================== بازیابی رمز ==================== */}
      <SecurityRecoverySection />
    </div>
  );
};

// ==================== Field Component ====================
interface FieldProps {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  type?: string;
  note?: string;
}

const Field = ({
  label,
  icon: Icon,
  value,
  onChange,
  editing,
  type = "text",
  note,
}: FieldProps) => (
  <div>
    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
      <Icon size={10} />
      {label}
    </label>
    {editing ? (
      type === "date" ? (
        <DateWheelPickerModal
          value={value}
          onChange={onChange}
          aria-label={label}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
        />
      )
    ) : (
      <div className="rounded-xl border border-gray-200/70 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white min-h-[42px] flex items-center">
        {/* ✅ اگه type="date" بود، شمسی نشون بده */}
        {type === "date" && value ? formatJalaliDisplay(value) : value || "—"}
      </div>
    )}
    {note && (
      <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
        {note}
      </p>
    )}
  </div>
);

export default ProfilePanel;
