import {
  Banknote,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Compass,
  CreditCard,
  FileCheck2,
  FileQuestion,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PenTool,
  Settings,
  Sparkles,
  Swords,
  Target,
  Trophy,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export type DashboardSection =
  | "home"
  | "profile"
  | "exams"
  | "arena"
  | "subscription"
  | "payments"
  | "wallet"
  | "strategy"
  | "notifications"
  | "settings"
  | "users"
  | "question-bank"
  | "question-designer"
  | "question-review"
  | "question-analytics"
  | "exam-builder"
  | "booklets"
  | "reports"
  | "admin-users"
  | "withdraw-requests"
  | "admin-arena-leagues"
  | "admin-comments"
  | "admin-strategy-plans"
  | "my-blog-posts"
  | "new-blog-post"
  | "admin-blog"
  | "study-plans"
  | "counselor-students";
interface MenuItem {
  id: DashboardSection;
  label: string;
  icon: typeof LayoutDashboard;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

// 🔹 منوی مخصوص هر نقش
const getMenuForRole = (role?: string): MenuGroup[] => {
  // ==================== STUDENT ====================
  if (!role || role === "STUDENT") {
    return [
      {
        title: "حساب کاربری",
        items: [
          { id: "home", label: "داشبورد", icon: LayoutDashboard },
          { id: "profile", label: "پروفایل", icon: User },
        ],
      },
      {
        title: "آموزش",
        items: [
          { id: "exams", label: "آزمون‌ها", icon: FileText },
          { id: "arena", label: "آرنا", icon: Swords },
          { id: "strategy", label: "برنامه راهبردی", icon: CalendarDays },
          { id: "study-plans", label: "برنامه مطالعاتی", icon: Target },
        ],
      },
      {
        title: "مالی",
        items: [
          { id: "subscription", label: "وضعیت اشتراک", icon: CreditCard },
          { id: "wallet", label: "کیف پول", icon: Wallet },
          { id: "payments", label: "سوابق پرداخت", icon: CreditCard },
        ],
      },
      {
        title: "سیستم",
        items: [
          { id: "notifications", label: "اعلان‌ها", icon: Bell },
          { id: "settings", label: "تنظیمات", icon: Settings },
        ],
      },
    ];
  }

  // ==================== ADMIN ====================
  if (role === "ADMIN") {
    return [
      {
        title: "داشبورد",
        items: [
          { id: "home", label: "داشبورد", icon: LayoutDashboard },
          { id: "profile", label: "پروفایل", icon: User },
        ],
      },
      {
        title: "مدیریت کاربران",
        items: [
          { id: "admin-users", label: "کاربران", icon: Users },
          {
            id: "withdraw-requests",
            label: "درخواست‌های برداشت",
            icon: Banknote,
          },
          {
            id: "admin-comments",
            label: "مدیریت نظرات",
            icon: MessageSquare,
          },
        ],
      },
      {
        title: "وبلاگ",
        items: [{ id: "admin-blog", label: "مدیریت وبلاگ", icon: BookOpen }],
      },
      {
        title: "آرنا",
        items: [
          { id: "admin-arena-leagues", label: "مدیریت لیگ‌ها", icon: Layers },
        ],
      },
      {
        title: "آزمون",
        items: [
          { id: "question-bank", label: "بانک سوالات", icon: FileQuestion },
          { id: "question-review", label: "بررسی سوالات", icon: FileCheck2 },
          { id: "booklets", label: "مدیریت دفترچه‌ها", icon: BookOpen },
          { id: "exam-builder", label: "مدیریت آزمون‌ها", icon: ClipboardList },
        ],
      },
      {
        title: "برنامه راهبردی",
        items: [
          {
            id: "admin-strategy-plans",
            label: "مدیریت برنامهها",
            icon: Compass,
          },
        ],
      },
      {
        title: "برنامه مطالعاتی",
        items: [
          { id: "counselor-students", label: "دانش‌آموزان و برنامه‌ها", icon: Target },
        ],
      },
      {
        title: "مالی",
        items: [
          { id: "wallet", label: "کیف پول", icon: Wallet },
          { id: "payments", label: "سوابق پرداخت", icon: CreditCard },
        ],
      },
      {
        title: "سیستم",
        items: [
          { id: "notifications", label: "اعلان‌ها", icon: Bell },
          { id: "settings", label: "تنظیمات", icon: Settings },
        ],
      },
    ];
  }

  // ==================== QUESTION_DESIGNER ====================
  if (role === "QUESTION_DESIGNER") {
    return [
      {
        title: "داشبورد",
        items: [
          { id: "home", label: "داشبورد", icon: LayoutDashboard },
          { id: "profile", label: "پروفایل", icon: User },
        ],
      },
      {
        title: "آزمون",
        items: [
          { id: "question-bank", label: "بانک سوالات", icon: FileQuestion },
          { id: "question-designer", label: "طراحی سوال", icon: PenTool },
        ],
      },
      {
        title: "مالی",
        items: [
          { id: "wallet", label: "کیف پول", icon: Wallet },
          { id: "payments", label: "سوابق پرداخت", icon: CreditCard },
        ],
      },
      {
        title: "سیستم",
        items: [
          { id: "notifications", label: "اعلان‌ها", icon: Bell },
          { id: "settings", label: "تنظیمات", icon: Settings },
        ],
      },
    ];
  }

  // ==================== COUNSELOR ====================
  if (role === "COUNSELOR") {
    return [
      {
        title: "داشبورد",
        items: [
          { id: "home", label: "داشبورد", icon: LayoutDashboard },
          { id: "profile", label: "پروفایل", icon: User },
        ],
      },
      {
        title: "دانش‌آموزان",
        items: [
          { id: "users", label: "دانش‌آموزان", icon: Users },
          { id: "counselor-students", label: "لیست دانش‌آموزان", icon: Users },
        ],
        
      },
      {
        title: "آزمون",
        items: [
          { id: "exams", label: "آزمون‌ها", icon: ClipboardList },
          { id: "arena", label: "آرنا", icon: Trophy },
        ],
      },
      {
        title: "وبلاگ",
        items: [
          { id: "new-blog-post", label: "مقاله جدید", icon: BookOpen },
          { id: "my-blog-posts", label: "مقالات من", icon: BookOpen },
        ],
      },
      {
        title: "مالی",
        items: [
          { id: "wallet", label: "کیف پول", icon: Wallet },
          { id: "payments", label: "سوابق پرداخت", icon: CreditCard },
        ],
      },
      {
        title: "سیستم",
        items: [
          { id: "notifications", label: "اعلان‌ها", icon: Bell },
          { id: "settings", label: "تنظیمات", icon: Settings },
        ],
      },
    ];
  }

  return [];
};

// 🔹 ترجمه‌ی نقش به فارسی
const getRoleLabel = (role?: string) => {
  if (!role) return "کاربر";
  if (role === "ADMIN") return "مدیر سیستم";
  if (role === "QUESTION_DESIGNER") return "طراح سؤال";
  if (role === "COUNSELOR") return "مشاور";
  return "دانش‌آموز";
};

interface DashboardSidebarProps {
  active: DashboardSection;
  onChange: (section: DashboardSection) => void;
  onClose?: () => void;
}

export default function DashboardSidebar({
  active,
  onChange,
  onClose,
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const menuGroups = getMenuForRole(user?.role?.name);
  const roleLabel = getRoleLabel(user?.role?.name);

  const handleLogout = () => {
    if (window.confirm("آیا از حساب کاربری خارج می‌شوی؟")) {
      logout();
    }
  };

  return (
    <aside className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl flex flex-col">
      {/* خط طلایی بالا */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/60 to-transparent" />

      {/* ==================== هدر کاربر ==================== */}
      <div className="relative p-4 border-b border-gray-200/70 dark:border-white/5">
        <div className="flex items-center gap-3">
          {/* آواتار */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-50" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-lg shadow-lg">
              {user?.firstName?.charAt(0) || "?"}
            </div>
          </div>

          {/* نام + نقش */}
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="inline-flex items-center gap-1 mt-0.5">
              <Sparkles size={9} className="text-[var(--griffin-gold)]" />
              <span className="text-[10px] font-black text-[var(--griffin-gold)] tracking-wide">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* دکمه بستن (موبایل) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن منو"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors lg:hidden"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ==================== منو ==================== */}
      <nav className="relative flex-1 overflow-y-auto p-3 dashboard-scroll">
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? "mt-5" : ""}>
            {/* عنوان گروه */}
            <div className="flex items-center gap-2 px-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {group.title}
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 dark:via-white/5 to-transparent" />
            </div>

            {/* آیتم‌ها */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      onClose?.();
                    }}
                    className={`
                      group relative w-full flex items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-right text-xs font-bold
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-gradient-to-l from-[var(--griffin-gold)]/15 to-transparent text-[var(--griffin-gold)] border border-[var(--griffin-gold)]/30"
                          : "text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent"
                      }
                    `}
                  >
                    {/* خط رنگی سمت راست */}
                    {isActive && (
                      <span className="absolute top-1.5 bottom-1.5 right-0 w-0.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)]" />
                    )}

                    <Icon
                      size={15}
                      className={`
                        shrink-0 transition-transform duration-200
                        ${isActive ? "" : "group-hover:scale-110"}
                      `}
                      strokeWidth={isActive ? 2.4 : 2}
                    />

                    <span className="relative z-10 flex-1 truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ==================== فوتر (خروج) ==================== */}
      <div className="relative p-3 border-t border-gray-200/70 dark:border-white/5">
        <button
          type="button"
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-right text-xs font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <LogOut
            size={15}
            className="shrink-0 transition-transform group-hover:-translate-x-0.5"
          />
          <span>خروج از حساب</span>
        </button>
      </div>
    </aside>
  );
}
