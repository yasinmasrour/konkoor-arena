import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Filter,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  type ContactMessage,
  deleteContactMessage,
  getContactStats,
  listContactMessages,
  updateContactMessage,
} from "../../api/contactApi";
import ConfirmDeleteModal from "../../components/comments/ConfirmDeleteModal";

const STATUS_LABELS: Record<
  ContactMessage["status"],
  { label: string; className: string }
> = {
  NEW: {
    label: "جدید",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  READ: {
    label: "خوانده‌شده",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  REPLIED: {
    label: "پاسخ داده‌شده",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  ARCHIVED: {
    label: "بایگانی",
    className: "bg-gray-500/15 text-gray-500",
  },
};

const AdminContactMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({ newCount: 0, totalCount: 0 });

  // فیلترها
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ContactMessage["status"] | ""
  >("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // انتخاب شده
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ==================== Load ====================
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [listRes, statsRes] = await Promise.all([
        listContactMessages({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        }),
        getContactStats(),
      ]);
      setMessages(listRes.items);
      setTotalPages(listRes.pagination.totalPages);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to load contact messages:", err);
      setError("دریافت پیام‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // دیبانس سرچ
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      void load();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // auto-hide success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(t);
  }, [success]);

  // ==================== Actions ====================
  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    // اگه NEW بود، خودکار READ کن
    if (msg.status === "NEW") {
      try {
        await updateContactMessage(msg.id, { status: "READ" });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "READ" } : m)),
        );
        setSelected((s) => (s ? { ...s, status: "READ" } : s));
        setStats((s) => ({ ...s, newCount: Math.max(0, s.newCount - 1) }));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const handleChangeStatus = async (
    msg: ContactMessage,
    status: ContactMessage["status"],
  ) => {
    setActionLoading(msg.id);
    try {
      const res = await updateContactMessage(msg.id, { status });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? res.contactMessage : m)),
      );
      setSelected(res.contactMessage);
      setSuccess("وضعیت پیام آپدیت شد.");
      void load();
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("آپدیت وضعیت انجام نشد.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNote = async (msg: ContactMessage, adminNote: string) => {
    setActionLoading(msg.id);
    try {
      const res = await updateContactMessage(msg.id, { adminNote });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? res.contactMessage : m)),
      );
      setSelected(res.contactMessage);
      setSuccess("یادداشت ذخیره شد.");
    } catch (err) {
      console.error("Failed to save note:", err);
      setError("ذخیره یادداشت انجام نشد.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setActionLoading(deleting.id);
    try {
      await deleteContactMessage(deleting.id);
      setMessages((prev) => prev.filter((m) => m.id !== deleting.id));
      setDeleting(null);
      if (selected?.id === deleting.id) setSelected(null);
      setSuccess("پیام حذف شد.");
      void load();
    } catch (err) {
      console.error("Failed to delete:", err);
      setError("حذف پیام انجام نشد.");
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== Render ====================
  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 overflow-x-hidden">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به داشبورد
          </button>

          {/* Hero */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[70px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-50" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-xl rotate-3 border-2 border-white/10">
                  <MessageSquare size={28} />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Admin Panel
                </p>
                <h1 className="font-heading text-2xl font-black text-white -mt-0.5">
                  پیام‌های تماس
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {stats.totalCount} پیام — {stats.newCount} پیام جدید
                </p>
              </div>

              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-colors shrink-0"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                بروزرسانی
              </button>
            </div>
          </section>

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2">
              <CheckCircle2
                size={14}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex-1">
                {success}
              </p>
              <button
                onClick={() => setSuccess("")}
                className="shrink-0 text-emerald-500 hover:text-emerald-600"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2">
              <AlertCircle
                size={14}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex-1">
                {error}
              </p>
              <button
                onClick={() => setError("")}
                className="shrink-0 text-rose-500 hover:text-rose-600"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در نام، ایمیل، موضوع یا متن..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] pr-9 pl-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
              />
            </div>

            <div className="relative shrink-0">
              <Filter
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as ContactMessage["status"] | "",
                  );
                  setPage(1);
                }}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] pr-9 pl-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
              >
                <option value="">همه</option>
                <option value="NEW">جدید</option>
                <option value="READ">خوانده‌شده</option>
                <option value="REPLIED">پاسخ داده‌شده</option>
                <option value="ARCHIVED">بایگانی</option>
              </select>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <LoaderCircle
                size={28}
                className="text-[var(--griffin-gold)] animate-spin"
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
              <MessageSquare size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">هیچ پیامی وجود نداره</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const statusInfo = STATUS_LABELS[msg.status];
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => void handleOpenMessage(msg)}
                    className="w-full text-right rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 hover:border-[var(--griffin-gold)]/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                        {msg.user && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-[10px] font-black">
                            <UserIcon size={9} />
                            کاربر لاگین‌شده
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-black text-gray-900 dark:text-white">
                      {msg.subject}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {msg.message}
                    </p>

                    <div className="mt-3 flex items-center gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <UserIcon size={10} />
                        {msg.name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mail size={10} />
                        {msg.email}
                      </span>
                      {msg.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={10} />
                          {msg.phone}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-black text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                قبلی
              </button>
              <span className="text-xs font-bold text-gray-500">
                صفحه {page} از {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-black text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                بعدی
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selected && (
        <MessageDetailModal
          message={selected}
          onClose={() => setSelected(null)}
          onChangeStatus={handleChangeStatus}
          onSaveNote={handleSaveNote}
          onDelete={() => setDeleting(selected)}
          actionLoading={actionLoading === selected.id}
        />
      )}

      {/* Delete Confirm */}
      {deleting && (
        <ConfirmDeleteModal
          title="حذف پیام"
          message={`آیا از حذف پیام "${deleting.subject}" مطمئنی؟`}
          onClose={() => setDeleting(null)}
          onConfirm={() => void handleDeleteConfirm()}
          loading={actionLoading === deleting.id}
        />
      )}
    </>
  );
};

// ==================== MessageDetailModal ====================
interface MessageDetailModalProps {
  message: ContactMessage;
  onClose: () => void;
  onChangeStatus: (
    msg: ContactMessage,
    status: ContactMessage["status"],
  ) => void;
  onSaveNote: (msg: ContactMessage, note: string) => void;
  onDelete: () => void;
  actionLoading: boolean;
}

const MessageDetailModal = ({
  message,
  onClose,
  onChangeStatus,
  onSaveNote,
  onDelete,
  actionLoading,
}: MessageDetailModalProps) => {
  const [note, setNote] = useState(message.adminNote || "");
  const [noteDirty, setNoteDirty] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-5 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <MessageSquare
              size={18}
              className="text-[var(--griffin-gold)] shrink-0"
            />
            <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white truncate">
              {message.subject}
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
        <div className="p-5 space-y-5">
          {/* Sender Info */}
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoRow icon={UserIcon} label="فرستنده" value={message.name} />
            <InfoRow icon={Mail} label="ایمیل" value={message.email} />
            {message.phone && (
              <InfoRow icon={Phone} label="تلفن" value={message.phone} />
            )}
            <InfoRow
              icon={Clock}
              label="تاریخ ارسال"
              value={new Date(message.createdAt).toLocaleString("fa-IR")}
            />
          </div>

          {message.user && (
            <div className="rounded-xl border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5 p-3">
              <p className="text-[11px] font-bold text-[var(--griffin-gold)]">
                فرستاده‌شده توسط کاربر لاگین‌شده: {message.user.firstName}{" "}
                {message.user.lastName} (@{message.user.username})
              </p>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              متن پیام
            </p>
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] p-4">
              <p className="text-sm leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {message.message}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              وضعیت
            </p>
            <div className="flex flex-wrap gap-2">
              {(["NEW", "READ", "REPLIED", "ARCHIVED"] as const).map((s) => {
                const info = STATUS_LABELS[s];
                const isActive = message.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChangeStatus(message, s)}
                    disabled={actionLoading || isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors disabled:cursor-not-allowed ${
                      isActive
                        ? info.className
                        : "border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Note */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              یادداشت ادمین (فقط برای خودت)
            </p>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteDirty(true);
              }}
              rows={3}
              placeholder="یادداشت داخلی..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors resize-none"
            />
            {noteDirty && (
              <button
                type="button"
                onClick={() => {
                  onSaveNote(message, note);
                  setNoteDirty(false);
                }}
                disabled={actionLoading}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2 text-xs font-black text-white shadow-lg disabled:opacity-40 transition-transform hover:-translate-y-0.5"
              >
                {actionLoading ? (
                  <LoaderCircle size={12} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={12} />
                )}
                ذخیره یادداشت
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex flex-wrap gap-2">
            <a
              href={`mailto:${message.email}?subject=پاسخ به: ${encodeURIComponent(message.subject)}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-blue-500 to-blue-700 px-4 py-2 text-xs font-black text-white shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              <Mail size={12} />
              پاسخ با ایمیل
            </a>
            {message.phone && (
              <a
                href={`tel:${message.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-4 py-2 text-xs font-black text-white shadow-lg hover:-translate-y-0.5 transition-transform"
              >
                <Phone size={12} />
                تماس تلفنی
              </a>
            )}
            <button
              type="button"
              onClick={onDelete}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-2 text-xs font-black text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 transition-colors"
            >
              <Trash2 size={12} />
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] p-3">
    <div className="w-8 h-8 rounded-lg bg-[var(--griffin-gold)]/10 flex items-center justify-center text-[var(--griffin-gold)] shrink-0">
      <Icon size={14} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-xs font-bold text-gray-900 dark:text-white break-words">
        {value}
      </p>
    </div>
  </div>
);

export default AdminContactMessages;