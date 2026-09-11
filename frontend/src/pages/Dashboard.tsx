import WelcomeCard from "../components/dashboard/WelcomeCard";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import ActivityCard from "../components/dashboard/ActivityCard";
import MyAttempts from "../components/dashboard/MyAttempts";
import ArenaDashboardCard from "../components/dashboard/ArenaDashboardCard";
import SubscriptionDashboardCard from "../components/dashboard/SubscriptionDashboardCard";
import ProfileCompletionCard from "../components/dashboard/ProfileCompletionCard";
import RoleDashboardCards from "../components/dashboard/RoleDashboardCards";
import { useAuth } from "../context/AuthContext";
const Dashboard = () => {
  const { user } = useAuth();
  const isStudent = user?.role?.name === "STUDENT";

  return (
    <main
      className="
        min-h-screen
        px-6
        py-10
        bg-gray-50
        dark:bg-[#080B12]
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          space-y-8
        "
      >
        <WelcomeCard />

        <ProfileCompletionCard />

        <RoleDashboardCards />

        {isStudent ? (
          <>
            <StatsCard />
            <ArenaDashboardCard />
            <SubscriptionDashboardCard />
            <QuickActions />
            <MyAttempts />
            <ActivityCard />
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6 dark:border-white/10 dark:bg-[#111722]">
            <h2 className="text-xl font-bold">
              داشبورد نقش {user?.role?.name}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              ابزارها و دسترسی‌های متناسب با نقش شما در بخش بالا نمایش داده
              شده‌اند.
            </p>
          </section>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
