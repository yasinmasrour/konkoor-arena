import { memo, useState } from "react";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { deleteQuestion, type Question } from "../../../api/questionApi";

interface Props {
  question: Question | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const DeleteConfirmModal = memo(
  ({ question, onClose, onSuccess, onError }: Props) => {
    const [deleting, setDeleting] = useState(false);

    if (!question) return null;

    const handleDelete = async () => {
      if (deleting) return;
      setDeleting(true);
      try {
        await deleteQuestion(question.id);
        onSuccess("سؤال با موفقیت حذف شد.");
        onClose();
      } catch (err) {
        const statusCode = (err as { response?: { status?: number } })?.response
          ?.status;
        if (statusCode === 409) {
          onError(
            "این سؤال در آزمون‌ها استفاده شده و قابل حذف نیست. لطفاً به‌جای حذف، آن را آرشیو کنید.",
          );
        } else if (statusCode === 404) {
          onError("سؤال موردنظر پیدا نشد. شاید قبلاً حذف شده است.");
        } else {
          onError("حذف سؤال انجام نشد. دوباره تلاش کنید.");
        }
        onClose();
      } finally {
        setDeleting(false);
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 animate-[fadeIn_0.2s_ease-out]"
        onClick={() => !deleting && onClose()}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-white dark:bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

          <div className="p-6 text-center">
            <div className="inline-flex relative mb-4">
              <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-50" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <AlertTriangle size={24} />
              </div>
            </div>

            <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white mb-2">
              حذف سؤال؟
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-7">
              این عملیات قابل بازگشت نیست. آیا از حذف این سؤال مطمئن هستید؟
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] px-3 py-2">
              <span className="font-english text-[11px] font-black text-gray-600 dark:text-gray-300">
                {question.code}
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-6">
              {question.questionText}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200/70 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
            <button
              disabled={deleting}
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
            >
              انصراف
            </button>
            <button
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-rose-500 to-rose-700 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-500/40 hover:shadow-xl hover:shadow-rose-500/60 hover:-translate-y-0.5 disabled:opacity-50 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {deleting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    در حال حذف...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    حذف سؤال
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);

DeleteConfirmModal.displayName = "DeleteConfirmModal";

export default DeleteConfirmModal;
