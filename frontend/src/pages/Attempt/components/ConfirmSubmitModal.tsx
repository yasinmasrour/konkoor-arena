import { AlertCircle, CheckCircle2, Send, X } from "lucide-react";

interface ConfirmSubmitModalProps {
  totalQuestions: number;
  answeredCount: number;
  unansweredQuestions: number[];
  flaggedQuestions: number[];
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmSubmitModal = ({
  totalQuestions,
  answeredCount,
  unansweredQuestions,
  flaggedQuestions,
  submitting,
  onConfirm,
  onClose,
}: ConfirmSubmitModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#080B12]/95 backdrop-blur-2xl shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <Send size={20} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Submit
                </p>
                <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                  پایان آزمون
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm leading-7 text-gray-600 dark:text-gray-300 mb-5">
            مطمئنی می‌خوای آزمون رو تموم کنی؟ بعد از این، دیگه نمی‌تونی جواب‌ها
            رو تغییر بدی.
          </p>

          {/* خلاصه */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  جواب داده
                </span>
              </div>
              <p className="font-heading text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {answeredCount.toLocaleString("fa-IR")} /{" "}
                {totalQuestions.toLocaleString("fa-IR")}
              </p>
            </div>

            <div
              className={`
                rounded-2xl border p-3
                ${
                  unansweredQuestions.length > 0
                    ? "bg-rose-500/10 border-rose-500/30"
                    : "bg-gray-500/10 border-gray-500/30"
                }
              `}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle
                  size={12}
                  className={
                    unansweredQuestions.length > 0
                      ? "text-rose-500"
                      : "text-gray-500"
                  }
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    unansweredQuestions.length > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  نزده
                </span>
              </div>
              <p
                className={`font-heading text-xl font-black tabular-nums ${
                  unansweredQuestions.length > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {unansweredQuestions.length.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>

          {/* لیست سوالات نزده */}
          {unansweredQuestions.length > 0 && (
            <div className="rounded-2xl bg-rose-500/5 border border-rose-500/30 p-4 mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">
                سوالات نزده
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unansweredQuestions.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-black tabular-nums"
                  >
                    {n.toLocaleString("fa-IR")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* لیست سوالات علامت‌دار */}
          {flaggedQuestions.length > 0 && (
            <div className="rounded-2xl bg-amber-500/5 border border-amber-500/30 p-4 mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                سوالات علامت‌گذاری‌شده
              </p>
              <div className="flex flex-wrap gap-1.5">
                {flaggedQuestions.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black tabular-nums"
                  >
                    {n.toLocaleString("fa-IR")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm font-black text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50"
            >
              ادامه آزمون
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
            >
              {submitting ? "در حال ارسال..." : "پایان آزمون"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSubmitModal;
