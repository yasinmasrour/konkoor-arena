/* eslint-disable react-hooks/static-components */
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Megaphone,
  MousePointerClick,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  adminDeleteAnnouncement,
  adminListAnnouncements,
  adminToggleAnnouncementActive,
  VARIANT_STYLES,
  DISPLAY_TYPE_OPTIONS,
  getAnnouncementIcon,
  type AdminAnnouncement,
} from "../../api/announcementApi";
import ConfirmDeleteModal from "../../components/comments/ConfirmDeleteModal";
import AnnouncementFormModal from "../../components/admin/AnnouncementFormModal";

type FilterTab = "all" | "active" | "inactive";

const AdminAnnouncements = () => {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AdminAnnouncement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<AdminAnnouncement | null>(null);

  // ==================== Load ====================
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminListAnnouncements({
        isActive:
          filter === "all" ? undefined : filter === "active" ? true : false,
        limit: 50,
      });
      setAnnouncements(result.items);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setError("دریافت اعلان‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // auto-hide success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(t);
  }, [success]);

  // ==================== Actions ====================
  const handleToggle = async (ann: AdminAnnouncement) => {
    setActionLoading(ann.id);
    try {
      const result = await adminToggleAnnouncementActive(ann.id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? result.announcement : a)),
      );
      setSuccess(result.message);
    } catch (err) {
      console.error("Failed to toggle:", err);
      setError("تغییر وضعیت انجام نشد.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAnnouncement) return;
    setActionLoading(deletingAnnouncement.id);
    try {
      await adminDeleteAnnouncement(deletingAnnouncement.id);
      setAnnouncements((prev) =>
        prev.filter((a) => a.id !== deletingAnnouncement.id),
      );
      setDeletingAnnouncement(null);
      setSuccess("اعلان حذف شد.");
    } catch (err) {
      console.error("Failed to delete:", err);
      setError("حذف اعلان انجام نشد.");
      setDeletingAnnouncement(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (ann: AdminAnnouncement) => {
    setEditingAnnouncement(ann);
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setEditingAnnouncement(null);
  };

  const handleFormSuccess = () => {
    void load();
  };

  // ==================== Render ====================
  const tabs: Array<{ key: FilterTab; label: string }> = [
    { key: "all", label: "همه" },
    { key: "active", label: "فعال" },
    { key: "inactive", label: "غیرفعال" },
  ];

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
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-xl rotate-3 border-2 border-white/10">
                  <Megaphone size={28} />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Admin Panel
                </p>
                <h1 className="font-heading text-2xl font-black text-white -mt-0.5">
                  مدیریت اعلان‌ها
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {announcements.length} اعلان
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
                >
                  <Plus size={14} />
                  اعلان جدید
                </button>

                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw
                    size={13}
                    className={loading ? "animate-spin" : ""}
                  />
                  بروزرسانی
                </button>
              </div>
            </div>
          </section>

          {/* Messages */}
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
                className="shrink-0 text-emerald-500"
              >
                <X size={13} />
              </button>
            </div>
          )}
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
                className="shrink-0 text-rose-500"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`
                  inline-flex items-center gap-1.5 rounded-xl px-4 py-2
                  text-[11px] font-black transition-all
                  ${
                    filter === tab.key
                      ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                      : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <LoaderCircle
                size={28}
                className="text-[var(--griffin-gold)] animate-spin"
              />
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
              <Megaphone size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 mb-4">
                هیچ اعلانی وجود نداره
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
              >
                <Plus size={14} />
                ساخت اولین اعلان
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <AnnouncementItem
                  key={ann.id}
                  announcement={ann}
                  onToggle={() => void handleToggle(ann)}
                  onEdit={() => handleOpenEdit(ann)}
                  onDelete={() => setDeletingAnnouncement(ann)}
                  actionLoading={actionLoading === ann.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showFormModal && (
        <AnnouncementFormModal
          key={editingAnnouncement?.id ?? "new"}
          announcement={editingAnnouncement}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirm */}
      {deletingAnnouncement && (
        <ConfirmDeleteModal
          title="حذف اعلان"
          message={`آیا از حذف "${deletingAnnouncement.title}" مطمئنی؟`}
          onClose={() => setDeletingAnnouncement(null)}
          onConfirm={() => void handleDeleteConfirm()}
          loading={actionLoading === deletingAnnouncement.id}
        />
      )}
    </>
  );
};

// ==================== AnnouncementItem ====================
interface AnnouncementItemProps {
  announcement: AdminAnnouncement;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  actionLoading: boolean;
}

const AnnouncementItem = ({
  announcement,
  onToggle,
  onEdit,
  onDelete,
  actionLoading,
}: AnnouncementItemProps) => {
  const style = VARIANT_STYLES[announcement.variant] || VARIANT_STYLES.gold;
  const Icon = getAnnouncementIcon(announcement.icon);

  const displayLabel =
    DISPLAY_TYPE_OPTIONS.find((o) => o.value === announcement.displayType)
      ?.label || announcement.displayType;

  const isExpired =
    announcement.endsAt && new Date(announcement.endsAt) < new Date();
  const isNotStarted = new Date(announcement.startsAt) > new Date();

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden border p-5
        ${
          announcement.isActive
            ? "border-gray-200 dark:border-white/10"
            : "border-dashed border-gray-300 dark:border-white/10 opacity-70"
        }
        bg-white dark:bg-white/[0.03]
      `}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Preview Icon */}
        <div
          className={`shrink-0 w-full sm:w-20 h-20 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-lg`}
        >
          <Icon size={32} strokeWidth={2.3} className="text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {announcement.isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                <CheckCircle2 size={9} />
                فعال
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-500/15 text-gray-500 text-[10px] font-black">
                <EyeOff size={9} />
                غیرفعال
              </span>
            )}

            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                منقضی شده
              </span>
            )}

            {isNotStarted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black">
                شروع نشده
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
              {displayLabel}
            </span>

            {announcement.priority > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                اولویت: {announcement.priority}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
            {announcement.title}
          </h3>

          {/* Message */}
          {announcement.message && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {announcement.message}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Eye size={10} />
              {announcement.viewsCount.toLocaleString("fa-IR")} بازدید
            </span>
            <span className="inline-flex items-center gap-1">
              <MousePointerClick size={10} />
              {announcement.clicksCount.toLocaleString("fa-IR")} کلیک
            </span>
            <span className="inline-flex items-center gap-1">
              <X size={10} />
              {announcement.dismissesCount.toLocaleString("fa-IR")} بستن
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex sm:flex-col items-center gap-1 self-start">
          <button
            type="button"
            onClick={onToggle}
            disabled={actionLoading}
            title={announcement.isActive ? "غیرفعال کن" : "فعال کن"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all ${
              announcement.isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            {actionLoading ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : announcement.isActive ? (
              <Eye size={13} />
            ) : (
              <EyeOff size={13} />
            )}
          </button>

          <button
            type="button"
            onClick={onEdit}
            disabled={actionLoading}
            title="ویرایش"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-blue-500/15 hover:text-blue-500 disabled:opacity-40 transition-all"
          >
            <Pencil size={13} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={actionLoading}
            title="حذف"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 disabled:opacity-40 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
