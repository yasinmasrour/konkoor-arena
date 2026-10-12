import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScrollToTop from "../components/common/ScrollToTop";
import AnnouncementCardProvider from "../components/announcements/AnnouncementCardProvider";

const MainLayout = () => {
  const location = useLocation();

  const FULLSCREEN_ROUTES = [
    "/arena/match",
    "/arena/matchmaking",
    "/login",
    "/register",
    "/solo",
    "/dashboard/personal-exams",
    "/attempts",
    "/temp/schedule",
  ];

  const isFullscreen =
    FULLSCREEN_ROUTES.some((path) => location.pathname.startsWith(path)) ||
    // 🆕 صفحه Review پاسخنامه (بدون navbar/footer)
    location.pathname.endsWith("/review");

  if (isFullscreen) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        {/* 🆕 کارت اعلان گوشه پایین */}
        <AnnouncementCardProvider />
      </div>
    </>
  );
};

export default MainLayout;