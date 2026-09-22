import { AlertTriangle, LogOut, X } from "lucide-react";

interface ExitWarningModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

const ExitWarningModal = ({ onConfirm, onClose }: ExitWarningModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl overflow-hidden border border-rose-500/30 bg-white/95 dark:bg-[#080B12]/95 backdrop-blur-2xl shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 blur-lg opacity-60" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg">
                  <AlertTriangle size={22} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                  Warning
                </p>
                <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                  هشدار خروج
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
            اگه الان از آزمون خارج بشی، زمان دفترچه‌ات{" "}
            <strong className="text-rose-500">متوقف نمی‌شه</strong> و همچنان پیش
            می‌ره. دفعه بعد که برگردی، تایمر از همون جایی که الان هست ادامه پیدا
            می‌کنه.
          </p>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 mb-5">
            <p className="text-xs leading-6 text-amber-700 dark:text-amber-300 font-bold">
              💡 پیشنهاد: تا زمانی که دفترچه فعلی تموم نشده، بهتره از آزمون خارج
              نشی.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
            >
              ادامه آزمون
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={14} />
              خروج از آزمون
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitWarningModal;
