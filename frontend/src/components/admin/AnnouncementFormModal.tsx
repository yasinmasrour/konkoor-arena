/* eslint-disable react-hooks/static-components */
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  LoaderCircle,
  Sparkles,
  X,
} from "lucide-react";
import {
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  VARIANT_OPTIONS,
  DISPLAY_TYPE_OPTIONS,
  VARIANT_STYLES,
  ANNOUNCEMENT_ICONS,
  getAnnouncementIcon,
  type AnnouncementVariant,
  type AnnouncementDisplayType,
  type AdminAnnouncement,
} from "../../api/announcementApi";

interface AnnouncementFormModalProps {
  announcement?: AdminAnnouncement | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  variant: AnnouncementVariant;
  icon: string;
  displayType: AnnouncementDisplayType;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  dismissible: boolean;
  priority: number;
}

const AnnouncementFormModal = ({
  announcement,
  onClose,
  onSuccess,
}: AnnouncementFormModalProps) => {
  const isEdit = !!announcement;

  const [form, setForm] = useState<FormState>({
    title: announcement?.title || "",
    message: announcement?.message || "",
    ctaText: announcement?.ctaText || "",
    ctaLink: announcement?.ctaLink || "",
    variant: announcement?.variant || "gold",
    icon: announcement?.icon || "Gift",
    displayType: announcement?.displayType || "banner",
    isActive: announcement?.isActive ?? true,
    startsAt: announcement?.startsAt
      ? new Date(announcement.startsAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endsAt: announcement?.endsAt
      ? new Date(announcement.endsAt).toISOString().slice(0, 16)
      : "",
    dismissible: announcement?.dismissible ?? true,
    priority: announcement?.priority ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // آیکون انتخاب‌شده
  const SelectedIcon = getAnnouncementIcon(form.icon);

  // ==================== Submit ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim() || form.title.trim().length < 3) {
      setError("عنوان حداقل ۳ کاراکتر باشد");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim() || undefined,
        ctaText: form.ctaText.trim() || undefined,
        ctaLink: form.ctaLink.trim() || undefined,
        variant: form.variant,
        icon: form.icon || undefined,
        displayType: form.displayType,
        isActive: form.isActive,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        dismissible: form.dismissible,
        priority: Number(form.priority) || 0,
      };

      if (isEdit && announcement) {
        await adminUpdateAnnouncement(announcement.id, payload);
        setSuccess("اعلان ویرایش شد");
      } else {
        await adminCreateAnnouncement(payload);
        setSuccess("اعلان ساخته شد");
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره انجام نشد";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== Render ====================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-5 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 flex items-center justify-center text-[var(--griffin-gold)]">
              <SelectedIcon size={18} strokeWidth={2.3} />
            </div>
            <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
              {isEdit ? "ویرایش اعلان" : "اعلان جدید"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Messages */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2">
              <AlertCircle
                size={14}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2">
              <CheckCircle2
                size={14}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {success}
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              عنوان <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="مثلاً: اولین آزمون رایگان + ۳۰٪ تخفیف"
              maxLength={100}
              required
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
            />
            <p className="mt-1 text-[10px] text-gray-400">
              {form.title.length} / ۱۰۰
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              پیام (اختیاری)
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={2}
              maxLength={300}
              placeholder="توضیح کوتاه..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all resize-none"
            />
            <p className="mt-1 text-[10px] text-gray-400">
              {form.message.length} / ۳۰۰
            </p>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              <Sparkles size={10} />
              آیکون
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {ANNOUNCEMENT_ICONS.map(({ value, label, Icon }) => {
                const isActive = form.icon === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon: value }))}
                    title={label}
                    className={`
                      relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1
                      transition-all border
                      ${
                        isActive
                          ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] shadow-lg shadow-[var(--griffin-gold)]/20"
                          : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    <Icon size={18} strokeWidth={2.3} />
                    <span className="text-[8px] font-black leading-none">
                      {label}
                    </span>
                    {isActive && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_6px_var(--griffin-gold)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variant */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              رنگ
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {VARIANT_OPTIONS.map((v) => {
                const s = VARIANT_STYLES[v.value];
                const isActive = form.variant === v.value;
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, variant: v.value }))}
                    className={`
                      h-11 rounded-xl bg-gradient-to-br ${s.bg}
                      text-[10px] font-black text-white
                      transition-all relative overflow-hidden
                      ${
                        isActive
                          ? "ring-2 ring-offset-2 ring-[var(--griffin-gold)] ring-offset-white dark:ring-offset-[#0a0d14] scale-105"
                          : "hover:scale-105"
                      }
                    `}
                  >
                    {v.label}
                    {isActive && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                متن دکمه (اختیاری)
              </label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaText: e.target.value }))
                }
                placeholder="مثلاً: شروع کن"
                maxLength={50}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <LinkIcon size={10} />
                لینک دکمه (اختیاری)
              </label>
              <input
                type="text"
                value={form.ctaLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaLink: e.target.value }))
                }
                placeholder="/register یا https://..."
                dir="ltr"
                maxLength={200}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all font-english"
              />
            </div>
          </div>

          {/* Display Type */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              محل نمایش
            </label>
            <div className="grid sm:grid-cols-3 gap-2">
              {DISPLAY_TYPE_OPTIONS.map((opt) => {
                const isActive = form.displayType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, displayType: opt.value }))
                    }
                    className={`
                      p-3 rounded-xl text-right transition-all border
                      ${
                        isActive
                          ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10"
                          : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] hover:border-[var(--griffin-gold)]/40"
                      }
                    `}
                  >
                    <p
                      className={`text-xs font-black ${
                        isActive
                          ? "text-[var(--griffin-gold)]"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                شروع نمایش
              </label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startsAt: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                پایان نمایش (اختیاری)
              </label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endsAt: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                اگه خالی باشه، همیشه نمایش داده میشه
              </p>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              اولویت (۰ تا ۱۰۰)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  priority: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
            />
            <p className="mt-1 text-[10px] text-gray-400">
              عدد بالاتر = اولویت بالاتر
            </p>
          </div>

          {/* Toggles */}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] cursor-pointer hover:border-[var(--griffin-gold)]/40 transition-all">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="w-4 h-4 accent-[var(--griffin-gold)]"
              />
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-white">
                  فعال
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  الان توی سایت نمایش داده بشه
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] cursor-pointer hover:border-[var(--griffin-gold)]/40 transition-all">
              <input
                type="checkbox"
                checked={form.dismissible}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dismissible: e.target.checked }))
                }
                className="w-4 h-4 accent-[var(--griffin-gold)]"
              />
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-white">
                  قابل بستن
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  کاربر بتونه ببنده
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 font-black text-white text-sm shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-40 transition-all"
            >
              {saving ? (
                <>
                  <LoaderCircle size={14} className="animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  {isEdit ? "ذخیره تغییرات" : "ساخت اعلان"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-white/10 px-6 py-3 text-sm font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
