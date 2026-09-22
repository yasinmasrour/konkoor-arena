import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Crown,
  Filter,
  LoaderCircle,
  Sparkles,
  Swords,
  Trash2,
  Trophy,
  Wallet,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  type Notification,
} from "../api/notificationApi";

// ==================== Icon Map ====================
const iconMap: Record<string, typeof Bell> = {
  trophy: Trophy,
  swords: Swords,
  wallet: Wallet,
  "credit-card": CreditCard,
  "check-circle": Check,
  "x-circle": X,
  crown: Crown,
  clock: Clock,
  bell: Bell,
  alert: AlertCircle,
};

// ==================== Type Labels ====================
const typeLabels: Record<string, string> = {
  ARENA_REWARD: "جایزه آرنا",
  ARENA_MATCH_INVITE: "دعوت به نبرد",
  WALLET_CHARGE: "شارژ کیف پول",
  WALLET_WITHDRAW: "برداشت",
  PAYMENT_SUCCESS: "پرداخت موفق",
  PAYMENT_FAILED: "پرداخت ناموفق",
  SUBSCRIPTION_ACTIVATED: "فعال‌سازی اشتراک",
  SUBSCRIPTION_EXPIRING: "اشتراک در حال انقضا",
  EXAM_NEW: "آزمون جدید",
  QUESTION_REVIEW: "بررسی سؤال",
  QUESTION_APPROVED: "تأیید سؤال",
  QUESTION_REJECTED: "رد سؤال",
  SYSTEM: "سیستمی",
};

// ==================== Type Style ====================
const getTypeStyle = (type: string) => {
  if (
    type.includes("REWARD") ||
    type.includes("SUCCESS") ||
    type.includes("APPROVED")
  ) {
    return {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    };
  }
  if (
    type.includes("FAILED") ||
    type.includes("REJECTED") ||
    type.includes("EXPIRING")
  ) {
    return {
      bg: "bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/20",
    };
  }
  if (type.includes("WITHDRAW") || type.includes("REVIEW")) {
    return {
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
    };
  }
  if (type.includes("SUBSCRIPTION") || type.includes("ARENA")) {
    return {
      bg: "bg-[var(--griffin-gold)]/10",
      text: "text-[var(--griffin-gold)]",
      border: "border-[var(--griffin-gold)]/20",
    };
  }
  return {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  };
};

// ==================== Time Ago ====================
const timeAgo = (date: string) => {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "همین الان";
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} روز پیش`;
  return new Date(date).toLocaleDateString("fa-IR");
};

type FilterType = "all" | "unread";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getMyNotifications({
        page,
        limit: pagination.limit,
        onlyUnread: filter === "unread",
      });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) {
      if (notification.link) navigate(notification.link);
      return;
    }

    try {
      await markAsRead(notification.id);
      setNotifications((current) =>
        current.map((n) =>
          n.id === notification.id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      if (notification.link) navigate(notification.link);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((current) =>
        current.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const wasUnread = !notifications.find((n) => n.id === id)?.isRead;
      await deleteNotification(id);
      setNotifications((current) => current.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearRead = async () => {
    if (clearing) return;
    if (!window.confirm("همه اعلان‌های خوانده‌شده حذف بشن؟")) return;
    setClearing(true);
    try {
      await deleteReadNotifications();
      setNotifications((current) => current.filter((n) => !n.isRead));
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
    } finally {
      setClearing(false);
    }
  };

  const hasReadNotifications = useMemo(
    () => notifications.some((n) => n.isRead),
    [notifications],
  );

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* ==================== HERO (تیره) ==================== */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <Bell size={32} strokeWidth={2.3} />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg border-2 border-[#080B12]">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount.toLocaleString("fa-IR")}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-right">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles
                  size={12}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Notifications
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                اعلان‌ها
              </h1>

              <p className="mt-1.5 text-sm text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount.toLocaleString("fa-IR")} اعلان خوانده‌نشده داری`
                  : "همه اعلان‌ها خوانده شده"}
              </p>
            </div>
          </div>
        </section>

        {/* ==================== Toolbar ==================== */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200/70 dark:border-white/5">
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                <Filter size={11} />
                فیلتر:
              </div>

              {[
                {
                  key: "all" as FilterType,
                  label: "همه",
                  count: pagination.total,
                },
                {
                  key: "unread" as FilterType,
                  label: "خوانده‌نشده",
                  count: unreadCount,
                },
              ].map((tab) => {
                const isActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-3.5 py-2
                      text-[11px] font-black transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                          : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    {tab.label}
                    <span
                      className={`
                        inline-flex items-center justify-center min-w-[18px] h-[16px] px-1.5 rounded-md
                        text-[9px] font-black tabular-nums
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                        }
                      `}
                    >
                      {tab.count.toLocaleString("fa-IR")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllAsRead()}
                  disabled={markingAll}
                  className="group inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-colors disabled:opacity-50"
                >
                  {markingAll ? (
                    <LoaderCircle size={12} className="animate-spin" />
                  ) : (
                    <CheckCheck size={12} />
                  )}
                  خواندن همه
                </button>
              )}

              {hasReadNotifications && (
                <button
                  type="button"
                  onClick={() => void handleClearRead()}
                  disabled={clearing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                >
                  {clearing ? (
                    <LoaderCircle size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  حذف خونده‌شده‌ها
                </button>
              )}
            </div>
          </div>

          {/* ==================== لیست ==================== */}
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoaderCircle
                  size={28}
                  className="text-[var(--griffin-gold)] animate-spin"
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <Bell
                    size={28}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                  {filter === "unread"
                    ? "اعلان خوانده‌نشده‌ای نداری"
                    : "هنوز اعلانی نداری!"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  وقتی اتفاقی بیفته، اینجا نشون داده می‌شه
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = iconMap[notification.icon || "bell"] || Bell;
                const style = getTypeStyle(notification.type);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleMarkAsRead(notification)}
                    className={`
                      group relative w-full text-right
                      rounded-xl overflow-hidden
                      border p-4
                      flex items-start gap-3
                      transition-all duration-200
                      hover:-translate-y-0.5
                      ${
                        notification.isRead
                          ? "border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.04]"
                          : "border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5 dark:bg-[var(--griffin-gold)]/[0.04] hover:bg-[var(--griffin-gold)]/10"
                      }
                    `}
                  >
                    {!notification.isRead && (
                      <span className="absolute top-3 bottom-3 right-0 w-0.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)]" />
                    )}

                    <div
                      className={`
                        shrink-0 w-10 h-10 rounded-xl
                        flex items-center justify-center
                        ${style.bg} ${style.text}
                        border ${style.border}
                      `}
                    >
                      <Icon size={17} strokeWidth={2.3} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`
                              font-heading text-sm font-black leading-5
                              ${
                                notification.isRead
                                  ? "text-gray-500 dark:text-gray-400"
                                  : "text-gray-900 dark:text-white"
                              }
                            `}
                          >
                            {notification.title}
                          </p>

                          <span
                            className={`
                              inline-flex items-center gap-1
                              px-2 py-0.5 rounded-md
                              text-[9px] font-black
                              ${style.bg} ${style.text}
                            `}
                          >
                            {typeLabels[notification.type] || notification.type}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => void handleDelete(notification.id, e)}
                          aria-label="حذف"
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-6">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {timeAgo(notification.createdAt)}
                        </span>

                        {!notification.isRead && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[var(--griffin-gold)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_6px_var(--griffin-gold)]" />
                            جدید
                          </span>
                        )}

                        {notification.link && (
                          <span className="text-[10px] font-black text-[var(--griffin-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                            مشاهده ←
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ==================== Pagination ==================== */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-white/5">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                {pagination.totalPages.toLocaleString("fa-IR")}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => void load(pagination.page - 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => void load(pagination.page + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Notifications;
