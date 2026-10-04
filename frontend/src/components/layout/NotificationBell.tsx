import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  LoaderCircle,
  Trash2,
  Trophy,
  Wallet,
  CreditCard,
  Crown,
  Clock,
  BookOpen,
  Swords,
  ClipboardList,
  X,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from "../../api/notificationApi";
import { useAuth } from "../../context/AuthContext";

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
  "book-open": BookOpen,
  clipboard: ClipboardList,
  check: Check,
  x: X,
  bell: Bell,
  alert: AlertCircle,
};

// ==================== Type Colors ====================
const getTypeStyle = (type: string) => {
  if (
    type.includes("REWARD") ||
    type.includes("SUCCESS") ||
    type.includes("APPROVED")
  ) {
    return {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
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
      text: "text-rose-500",
      border: "border-rose-500/20",
    };
  }
  if (type.includes("WITHDRAW") || type.includes("REVIEW")) {
    return {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
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
    text: "text-purple-500",
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

// ==================== Component ====================
const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 🔹 بارگذاری اولیه unread count
  useEffect(() => {
    if (!user) return;

    const loadCount = async () => {
      try {
        const result = await getUnreadCount();
        setUnreadCount(result.unreadCount);
      } catch (error) {
        console.error("Failed to load unread count:", error);
      }
    };

    void loadCount();

    // 🔹 هر ۳۰ ثانیه چک کن
    const interval = window.setInterval(loadCount, 30000);
    return () => window.clearInterval(interval);
  }, [user]);

  // 🔹 بارگذاری لیست هنگام باز شدن
  useEffect(() => {
    if (!open || !user) return;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const result = await getMyNotifications({ page: 1, limit: 10 });
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, [open, user]);

  // 🔹 بستن با کلیک بیرون
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // 🔹 خواندن یه اعلان
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) {
      // اگه خوانده شده، فقط برو به لینک
      if (notification.link) {
        navigate(notification.link);
        setOpen(false);
      }
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

      if (notification.link) {
        navigate(notification.link);
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // 🔹 خواندن همه
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

  // 🔹 حذف
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const wasUnread = !notifications.find((n) => n.id === id)?.isRead;
      setNotifications((current) => current.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* ==================== دکمه Bell ==================== */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="اعلان‌ها"
        className={`
          relative
          w-9 h-9 md:w-10 md:h-10
          rounded-xl
          flex items-center justify-center
          border transition-colors duration-300
          ${
            open
              ? "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"
              : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)]"
          }
        `}
      >
        <Bell size={16} />

        {/* Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black shadow-lg">
              {unreadCount > 99 ? "99+" : unreadCount.toLocaleString("fa-IR")}
            </span>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500/40 animate-ping" />
          </>
        )}
      </button>

      {/* ==================== Overlay موبایل ==================== */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ==================== Dropdown ==================== */}
      {open && (
        <div
          className="
            fixed sm:absolute
            top-20 sm:top-full
            left-4 right-4 sm:left-auto sm:right-0
            sm:mt-2 z-50
            w-auto sm:w-[400px]
            max-h-[calc(100vh-6rem)] sm:max-h-[500px]
            rounded-2xl
            border border-gray-200 dark:border-white/10
            bg-white dark:bg-[#0a0d14]
            shadow-2xl shadow-black/10 dark:shadow-black/50
            overflow-hidden
            flex flex-col
            animate-[fadeInDown_0.2s_ease-out]
          "
        >
          {/* هدر */}
          <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                <Bell size={14} />
              </div>
              <div>
                <p className="font-heading text-xs font-black text-gray-900 dark:text-white">
                  اعلان‌ها
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {unreadCount > 0
                    ? `${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده`
                    : "همه خوانده شده"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllAsRead()}
                disabled={markingAll}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <LoaderCircle size={11} className="animate-spin" />
                ) : (
                  <CheckCheck size={11} />
                )}
                خواندن همه
              </button>
            )}
          </div>

          {/* لیست */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoaderCircle
                  size={20}
                  className="text-[var(--griffin-gold)] animate-spin"
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <Bell
                    size={24}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <p className="font-heading text-xs font-black text-gray-700 dark:text-gray-300">
                  اعلانی نداری!
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  وقتی اتفاقی بیفته، اینجا نشون داده می‌شه
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {notifications.map((notification) => {
                  const Icon = iconMap[notification.icon || "bell"] || Bell;
                  const style = getTypeStyle(notification.type);

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void handleMarkAsRead(notification)}
                      className={`
                        group relative w-full text-right
                        p-3.5 flex items-start gap-3
                        transition-colors duration-200
                        ${
                          notification.isRead
                            ? "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                            : "bg-[var(--griffin-gold)]/[0.03] hover:bg-[var(--griffin-gold)]/[0.06]"
                        }
                      `}
                    >
                      {/* خط رنگی چپ */}
                      {!notification.isRead && (
                        <span className="absolute top-3 bottom-3 right-0 w-0.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)]" />
                      )}

                      {/* آیکون */}
                      <div
                        className={`
                          shrink-0 w-9 h-9 rounded-xl
                          flex items-center justify-center
                          ${style.bg} ${style.text}
                          border ${style.border}
                        `}
                      >
                        <Icon size={15} strokeWidth={2.3} />
                      </div>

                      {/* محتوا */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`
                              font-heading text-xs font-black leading-5
                              ${notification.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white"}
                            `}
                          >
                            {notification.title}
                          </p>

                          {/* دکمه حذف */}
                          <button
                            type="button"
                            onClick={(e) =>
                              void handleDelete(notification.id, e)
                            }
                            aria-label="حذف"
                            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-5 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500">
                            {timeAgo(notification.createdAt)}
                          </span>

                          {!notification.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_6px_var(--griffin-gold)]" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* فوتر */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  navigate("/notifications");
                  setOpen(false);
                }}
                className="w-full py-2 rounded-xl text-[11px] font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-colors"
              >
                مشاهده همه اعلان‌ها
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
