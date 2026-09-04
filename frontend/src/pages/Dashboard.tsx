import WelcomeCard from "../components/dashboard/WelcomeCard";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import ActivityCard from "../components/dashboard/ActivityCard";
import MyAttempts from "../components/dashboard/MyAttempts";
import ArenaDashboardCard from "../components/dashboard/ArenaDashboardCard";
import SubscriptionDashboardCard from "../components/dashboard/SubscriptionDashboardCard";
const Dashboard = () => {
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

        <StatsCard />

        <ArenaDashboardCard />

        <SubscriptionDashboardCard />

        <QuickActions />

        <MyAttempts />

        <ActivityCard />

      </div>
    </main>
  );
};

export default Dashboard;
