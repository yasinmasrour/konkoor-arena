import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import DashboardSidebar, { type DashboardSection } from "./DashboardSidebar";
import DashboardHome from "../panels/DashboardHome";
import ProfilePanel from "../panels/ProfilePanel";
import ExamsPanel from "../panels/ExamsPanel";
import ArenaPanel from "../panels/ArenaPanel";
import SubscriptionPanel from "../panels/SubscriptionPanel";
import PaymentsPanel from "../panels/PaymentsPanel";
import WalletPanel from "../panels/WalletPanel";
import StrategyPanel from "../panels/StrategyPanel";
import AdminHome from "../panels/admin/AdminHome";
import AdminUsers from "../panels/admin/AdminUsers";
import SiteInfoPanel from "../panels/admin/SiteInfoPanel";
import { useAuth } from "../../../context/AuthContext";
import DesignerHome from "../panels/designer/DesignerHome";
import CounselorHome from "../panels/counselor/CounselorHome";
import SecurityRecoveryBanner from "../panels/SecurityRecoveryBanner";

const VALID_SECTIONS: DashboardSection[] = [
  "home",
  "profile",
  "exams",
  "arena",
  "subscription",
  "payments",
  "wallet",
  "strategy",
  "notifications",
  "settings",
  "users",
  "question-bank",
  "question-designer",
  "question-review",
  "question-analytics",
  "exam-builder",
  "booklets",
  "reports",
  "admin-users",
  "withdraw-requests",
  "admin-arena-leagues",
  "admin-comments",
  "admin-strategy-plans",
  "my-blog-posts",
  "new-blog-post",
  "admin-blog",
  "study-plans",
  "counselor-students",
  "admin-site-info",
  "contact-messages",
  "announcements",
];

const isValidSection = (value: string | null): value is DashboardSection => {
  return value !== null && VALID_SECTIONS.includes(value as DashboardSection);
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const role = user?.role?.name;

  const sectionParam = searchParams.get("section");
  const initialSection: DashboardSection = isValidSection(sectionParam)
    ? sectionParam
    : "home";

  const [active, setActive] = useState<DashboardSection>(initialSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const param = searchParams.get("section");
    if (isValidSection(param) && param !== active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const panels = useMemo(() => {
    const designerPanels: Record<string, React.ComponentType> = {
      home: DesignerHome,
      profile: ProfilePanel,
      wallet: WalletPanel,
      payments: PaymentsPanel,
      settings: ProfilePanel,
    };

    const counselorPanels: Record<string, React.ComponentType> = {
      home: CounselorHome,
      profile: ProfilePanel,
      wallet: WalletPanel,
      payments: PaymentsPanel,
      settings: ProfilePanel,
    };

    const studentPanels: Record<string, React.ComponentType> = {
      home: DashboardHome,
      profile: ProfilePanel,
      exams: ExamsPanel,
      arena: ArenaPanel,
      subscription: SubscriptionPanel,
      payments: PaymentsPanel,
      wallet: WalletPanel,
      strategy: StrategyPanel,
      notifications: DashboardHome,
      settings: ProfilePanel,
    };

    const adminPanels: Record<string, React.ComponentType> = {
      home: AdminHome,
      profile: ProfilePanel,
      "admin-users": AdminUsers,
      wallet: WalletPanel,
      payments: PaymentsPanel,
      settings: ProfilePanel,
      "admin-site-info": SiteInfoPanel,
    };

    if (role === "QUESTION_DESIGNER") return designerPanels;
    if (role === "COUNSELOR") return counselorPanels;
    if (role === "ADMIN") return adminPanels;
    return studentPanels;
  }, [role]);

  const handleSectionChange = (section: DashboardSection) => {
    if (section === "notifications") {
      navigate("/notifications");
      return;
    }

    if (section === "withdraw-requests") {
      navigate("/admin/withdraw-requests");
      return;
    }

    if (section === "admin-arena-leagues") {
      navigate("/admin/arena/leagues");
      return;
    }

    if (section === "admin-comments") {
      navigate("/admin/comments");
      return;
    }
    if (section === "admin-strategy-plans") {
      navigate("/admin/strategy-plans");
      return;
    }
    if (section === "my-blog-posts") {
      navigate("/dashboard/my-blog-posts");
      return;
    }

    if (section === "new-blog-post") {
      navigate("/dashboard/blog/new");
      return;
    }

    if (section === "admin-blog") {
      navigate("/admin/blog");
      return;
    }

    if (section === "study-plans") {
      navigate("/dashboard/study-plans");
      return;
    }

    if (section === "counselor-students") {
      navigate("/dashboard/counselor/students");
      return;
    }

    if (section === "contact-messages") {
      navigate("/admin/contact-messages");
      return;
    }
    if (section === "announcements") {
      navigate("/admin/announcements");
      return;
    }

    const externalRoutes: Partial<Record<DashboardSection, string>> = {
      "question-bank": "/question-bank",
      "question-review": "/question-review",
      booklets: "/booklets",
      "exam-builder": "/exam-builder",
      "question-designer": "/question-designer",
      "question-analytics": "/question-analytics",
    };

    const route = externalRoutes[section];
    if (route) {
      navigate(route);
      return;
    }

    setActive(section);
    setSearchParams({ section });
    setSidebarOpen(false);
  };

  const Panel = panels[active] || DashboardHome;

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      {/* ==================== دکمه منو (موبایل) ==================== */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-4 py-2.5 text-xs font-black text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all w-fit"
      >
        <Menu size={14} />
        منوی پنل
      </button>

      {/* ==================== Sidebar دسکتاپ ==================== */}
      <div className="hidden lg:block">
        <div className="sticky top-5">
          <DashboardSidebar active={active} onChange={handleSectionChange} />
        </div>
      </div>

      {/* ==================== Sidebar موبایل ==================== */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 z-50 w-[280px] lg:hidden animate-[slideInRight_0.3s_ease-out] p-2">
            <DashboardSidebar
              active={active}
              onChange={handleSectionChange}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* ==================== محتوای اصلی ==================== */}
      <section className="min-w-0">
        <SecurityRecoveryBanner />
        <br />
        <Panel />
      </section>
    </div>
  );
}
