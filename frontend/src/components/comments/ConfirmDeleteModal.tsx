import { AlertCircle, LoaderCircle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmDeleteModal = ({
  title = "حذف نظر",
  message = "آیا از حذف این نظر مطمئن هستی؟ این عمل قابل بازگشت نیست.",
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* خط رز */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        {/* هاله */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* هدر */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <Trash2 size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                Delete
              </p>
              <h2 className="font-heading text-lg font-black text-white">
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-rose-400 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* محتوا */}
        <div className="relative p-5">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-rose-300 leading-7">
              {message}
            </p>
          </div>
        </div>

        {/* فوتر */}
        <div className="relative p-4 border-t border-white/5 bg-white/[0.01] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-black text-gray-400 hover:border-white/20 hover:text-white disabled:opacity-40 transition-all"
          >
            لغو
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-rose-500 to-rose-700 px-4 py-3 font-heading font-black text-white text-xs shadow-lg shadow-rose-500/40 hover:shadow-xl disabled:opacity-40 transition-all"
          >
            {loading ? (
              <>
                <LoaderCircle size={13} className="animate-spin" />
                در حال حذف...
              </>
            ) : (
              <>
                <Trash2 size={13} />
                حذف کن
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
