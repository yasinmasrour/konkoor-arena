import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  LoaderCircle,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getSiteInfo,
  updateSiteInfo,
  type SiteInfoUpdatePayload,
} from "../../../../api/siteInfoApi";
import RevealOnScroll from "../../../common/RevealOnScroll";

const SiteInfoPanel = () => {
  const [form, setForm] = useState<SiteInfoUpdatePayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSiteInfo();
      setForm({
        phoneFixed: data.phoneFixed ?? "",
        phoneMobile: data.phoneMobile ?? "",
        emailMain: data.emailMain ?? "",
        emailSupport: data.emailSupport ?? "",
        address: data.address ?? "",
        instagramUrl: data.instagramUrl ?? "",
        telegramUrl: data.telegramUrl ?? "",
        aparatUrl: data.aparatUrl ?? "",
        workingHours: data.workingHours ?? "",
        aboutShort: data.aboutShort ?? "",
        enamadEnabled: data.enamadEnabled,
        enamadHtml: data.enamadHtml ?? "",
      });
    } catch {
      setError("دریافت اطلاعات سایت انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof SiteInfoUpdatePayload,
    value: string | boolean,
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateSiteInfo(form);
      setSuccess("اطلاعات سایت با موفقیت ذخیره شد.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره اطلاعات انجام نشد.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
        <LoaderCircle className="animate-spin" size={22} />
        در حال دریافت اطلاعات...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <RevealOnScroll>
        <div className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-amber-500/5 to-transparent p-6">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-[60px] pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-50" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <ShieldCheck size={22} />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Site Information
                </span>
              </div>
              <h1 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                اطلاعات سایت
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                اطلاعات تماس، شبکه‌های اجتماعی و Enamad
              </p>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* پیام‌ها */}
      {success && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
          <Check size={16} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {success}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {error}
          </p>
        </div>
      )}

      {/* بخش تماس */}
      <RevealOnScroll>
        <Section title="اطلاعات تماس">
          <Field
            label="شماره تلفن ثابت"
            value={form.phoneFixed ?? ""}
            onChange={(v) => handleChange("phoneFixed", v)}
            placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
          />
          <Field
            label="شماره موبایل / پشتیبانی"
            value={form.phoneMobile ?? ""}
            onChange={(v) => handleChange("phoneMobile", v)}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          />
          <Field
            label="ایمیل اصلی"
            value={form.emailMain ?? ""}
            onChange={(v) => handleChange("emailMain", v)}
            placeholder="info@griffin-academy.ir"
            type="email"
          />
          <Field
            label="ایمیل پشتیبانی"
            value={form.emailSupport ?? ""}
            onChange={(v) => handleChange("emailSupport", v)}
            placeholder="support@griffin-academy.ir"
            type="email"
          />
          <Field
            label="آدرس فیزیکی"
            value={form.address ?? ""}
            onChange={(v) => handleChange("address", v)}
            placeholder="تهران، خیابان ..."
            fullWidth
          />
        </Section>
      </RevealOnScroll>

      {/* بخش شبکه‌های اجتماعی */}
      <RevealOnScroll>
        <Section title="شبکه‌های اجتماعی">
          <Field
            label="لینک اینستاگرام"
            value={form.instagramUrl ?? ""}
            onChange={(v) => handleChange("instagramUrl", v)}
            placeholder="https://instagram.com/griffin"
            dir="ltr"
          />
          <Field
            label="لینک تلگرام"
            value={form.telegramUrl ?? ""}
            onChange={(v) => handleChange("telegramUrl", v)}
            placeholder="https://t.me/griffin"
            dir="ltr"
          />
          <Field
            label="لینک آپارات"
            value={form.aparatUrl ?? ""}
            onChange={(v) => handleChange("aparatUrl", v)}
            placeholder="https://aparat.com/griffin"
            dir="ltr"
          />
        </Section>
      </RevealOnScroll>

      {/* بخش سایر */}
      <RevealOnScroll>
        <Section title="سایر">
          <Field
            label="ساعات پاسخگویی"
            value={form.workingHours ?? ""}
            onChange={(v) => handleChange("workingHours", v)}
            placeholder="شنبه تا پنجشنبه، ۹ تا ۱۸"
            fullWidth
          />
          <Field
            label="متن کوتاه درباره سایت"
            value={form.aboutShort ?? ""}
            onChange={(v) => handleChange("aboutShort", v)}
            placeholder="آکادمی گریفین، پلتفرم هوشمند..."
            fullWidth
            textarea
          />
        </Section>
      </RevealOnScroll>

      {/* بخش Enamad */}
      <RevealOnScroll>
        <Section title="Enamad">
          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 cursor-pointer group rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-4 hover:border-[var(--griffin-gold)]/40 transition-colors">
              <input
                type="checkbox"
                checked={form.enamadEnabled ?? false}
                onChange={(e) =>
                  handleChange("enamadEnabled", e.target.checked)
                }
                className="sr-only"
              />
              <div
                className={`
                  shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5
                  ${
                    form.enamadEnabled
                      ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]"
                      : "border-gray-300 dark:border-white/20"
                  }
                `}
              >
                {form.enamadEnabled && (
                  <Check size={12} strokeWidth={3} className="text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  نمایش Enamad در فوتر
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  اگه فعال باشه، نشان Enamad توی فوتر نمایش داده میشه.
                </p>
              </div>
            </label>
          </div>

          <div className="sm:col-span-2">
            <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              کد HTML نشان
            </span>
            <textarea
              value={form.enamadHtml ?? ""}
              onChange={(e) => handleChange("enamadHtml", e.target.value)}
              rows={4}
              dir="ltr"
              placeholder="<a href='...'><img src='...' /></a>"
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
            />
          </div>
        </Section>
      </RevealOnScroll>

      {/* دکمه ذخیره */}
      <div className="sticky bottom-4 z-10">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="
            group relative w-full sm:w-auto
            inline-flex items-center justify-center gap-2
            rounded-xl
            bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
            px-8 py-3.5
            font-heading font-black text-white
            shadow-lg shadow-[var(--griffin-gold)]/40
            hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60
            hover:-translate-y-0.5
            disabled:opacity-50
            transition-all overflow-hidden
          "
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
                ذخیره تغییرات
              </>
            )}
          </span>
          <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    </div>
  );
};

// ==================== Sub-components ====================
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6">
    <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white mb-5">
      {title}
    </h2>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  dir?: "ltr" | "rtl";
  fullWidth?: boolean;
  textarea?: boolean;
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir,
  fullWidth,
  textarea,
}: FieldProps) => (
  <label className={`block ${fullWidth ? "sm:col-span-2" : ""}`}>
    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        dir={dir}
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
      />
    )}
  </label>
);

export default SiteInfoPanel;
