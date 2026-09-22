import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import FeatureGuard from "../components/common/FeatureGuard";
import Tests from "../pages/Tests";
import ExamDetail from "../pages/ExamDetail";
import Attempt from "../pages/Attempt";
import AttemptResult from "../pages/AttemptResult";
import AttemptReview from "../pages/AttemptReview";
import Arena from "../pages/Arena";
import Matchmaking from "../pages/Arena/Matchmaking";
import Match from "../pages/Arena/Match";
import ArenaProfile from "../pages/Arena/ArenaProfile";
import ArenaHistory from "../pages/Arena/ArenaHistory";
import ArenaRanking from "../pages/Arena/ArenaRanking";
import ArenaSeasonResults from "../pages/Arena/ArenaSeasonResults";
import ErrorPage from "../components/common/ErrorPage";
import RoleRoute from "./RoleRoute";
import Forbidden from "../pages/Forbidden";
import Subscriptions from "../pages/Subscriptions";
import QuestionBank from "../pages/Questions/QuestionBank";
import QuestionAnalyticsPage from "../pages/Questions/QuestionAnalytics";
import QuestionImport from "../pages/Questions/QuestionImport";
import QuestionDesigner from "../pages/Questions/QuestionDesigner";
import QuestionReview from "../pages/Questions/QuestionReview";
import BookletBuilder from "../pages/Booklets/BookletBuilder";
import ExamBuilder from "../pages/ExamBuilder";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Notifications from "../pages/Notifications";
import WithdrawRequests from "../pages/Admin/WithdrawRequests";
import InviteAccept from "../pages/Arena/InviteAccept";
import ArenaLeagues from "../pages/Admin/ArenaLeagues";
import Referral from "../pages/Referral";
import AdminComments from "../pages/Admin/AdminComments";
import Strategy from "../pages/Strategy";
import AdminStrategyPlans from "../pages/Admin/AdminStrategyPlans";
import StrategyPlanEditor from "../pages/Admin/StrategyPlanEditor";
import SoloSetup from "../pages/Solo/SoloSetup";
import SoloMatch from "../pages/Solo/SoloMatch";
import SoloResult from "../pages/Solo/SoloResult";
import SoloHistory from "../pages/Solo/SoloHistory";
import SoloStats from "../pages/Solo/SoloStats";
import BlogList from "../pages/Blog/BlogList";
import BlogPost from "../pages/Blog/BlogPost";
import BlogEditor from "../pages/Blog/BlogEditor";
import MyBlogPosts from "../pages/Blog/MyBlogPosts";
import AdminBlog from "../pages/Admin/AdminBlog";
import AdminBlogComments from "../pages/Admin/AdminBlogComments";
import MyStudyPlans from "../pages/StudyPlan/MyStudyPlans";
import StudyPlanDetail from "../pages/StudyPlan/StudyPlanDetail";
import PersonalExam from "../pages/PersonalExam/PersonalExam";
import PersonalExamResult from "../pages/PersonalExam/PersonalExamResult";
import StudentsList from "../pages/Counselor/StudentsList";
import StudentDetail from "../pages/Counselor/StudentDetail";
import StudyPlanEditor from "../pages/Counselor/StudyPlanEditor";
import PersonalExamBuilder from "../pages/Counselor/PersonalExamBuilder";
import AdminSubscriptionPlans from "../pages/Admin/AdminSubscriptionPlans";
import PaymentVerify from "../pages/PaymentVerify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },

      {
        element: <GuestRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },

      // ==================== Protected (عمومی) ====================
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "subscriptions", element: <Subscriptions /> },
          { path: "payment/verify", element: <PaymentVerify /> },
          { path: "notifications", element: <Notifications /> },
          { path: "referral", element: <Referral /> },

          // 🟢 برنامه راهبردی — آزاد برای همه
          { path: "strategy", element: <Strategy /> },

          // 🟢 وبلاگ شخصی — آزاد
          { path: "dashboard/blog/new", element: <BlogEditor /> },
          { path: "dashboard/blog/:id/edit", element: <BlogEditor /> },
          { path: "dashboard/my-blog-posts", element: <MyBlogPosts /> },

          // 🟢 لیست برنامه‌های مطالعاتی — آزاد (کاربر ببینه چیه)
          { path: "dashboard/study-plans", element: <MyStudyPlans /> },
          {
            path: "dashboard/study-plans/:id",
            element: <StudyPlanDetail />,
          },

          // 🔒 آزمون شخصی و نتیجه — نیاز به اشتراک
          {
            element: <FeatureGuard feature="study-plans" />,
            children: [
              {
                path: "dashboard/personal-exams/:id",
                element: <PersonalExam />,
              },
              {
                path: "dashboard/personal-exams/:id/result",
                element: <PersonalExamResult />,
              },
            ],
          },
        ],
      },

      // ==================== Admin Only ====================
      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,
        children: [
          { path: "question-review", element: <QuestionReview /> },
          { path: "admin/withdraw-requests", element: <WithdrawRequests /> },
          { path: "admin/arena/leagues", element: <ArenaLeagues /> },
          { path: "admin/comments", element: <AdminComments /> },
          { path: "admin/strategy-plans", element: <AdminStrategyPlans /> },
          { path: "admin/strategy-plans/new", element: <StrategyPlanEditor /> },
          {
            path: "admin/strategy-plans/:id/edit",
            element: <StrategyPlanEditor />,
          },
          { path: "admin/blog", element: <AdminBlog /> },
          { path: "admin/blog/new", element: <BlogEditor /> },
          { path: "admin/blog/comments", element: <AdminBlogComments /> },
          { path: "admin/blog/:id/edit", element: <BlogEditor /> },
          {
            path: "admin/subscription-plans",
            element: <AdminSubscriptionPlans />,
          },
        ],
      },

      // ==================== آزمون‌ها (عمومی) ====================
      {
        path: "tests",
        element: <Tests />,
      },
      {
        path: "tests/:id",
        element: <ExamDetail />,
      },
      {
        path: "attempts/:attemptId",
        element: <Attempt />,
      },
      {
        path: "attempts/:id/result",
        element: <AttemptResult />,
      },
      {
        path: "attempts/:id/review",
        element: <AttemptReview />,
      },

      // ==================== عمومی ====================
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "blog",
        element: <BlogList />,
      },
      {
        path: "blog/:slug",
        element: <BlogPost />,
      },

      // ==================== Protected (آرنا و بازی انفرادی) ====================
      {
        element: <ProtectedRoute />,
        children: [
          // 🟢 صفحه اصلی آرنا — آزاد (Landing + لیست لیگ‌ها)
          { path: "arena", element: <Arena /> },

          // 🟢 رتبه‌بندی لیگ — آزاد (برای جذابیت)
          { path: "arena/ranking/:leagueId", element: <ArenaRanking /> },

          // 🔒 بقیه صفحات آرنا — نیاز به اشتراک
          {
            element: <FeatureGuard feature="arena" />,
            children: [
              { path: "arena/profile", element: <ArenaProfile /> },
              { path: "arena/history", element: <ArenaHistory /> },
              {
                path: "arena/season/:leagueId",
                element: <ArenaSeasonResults />,
              },
              { path: "arena/leagues/:leagueId", element: <Matchmaking /> },
              { path: "arena/match/:matchId", element: <Match /> },
              { path: "arena/invite/:code", element: <InviteAccept /> },
            ],
          },

          // 🔒 بازی انفرادی — نیاز به اشتراک
          {
            element: <FeatureGuard feature="solo" />,
            children: [
              { path: "solo/setup", element: <SoloSetup /> },
              { path: "solo/:id", element: <SoloMatch /> },
              { path: "solo/:id/result", element: <SoloResult /> },
              { path: "solo/history", element: <SoloHistory /> },
              { path: "solo/stats", element: <SoloStats /> },
            ],
          },
        ],
      },

      // ==================== 403 ====================
      {
        path: "403",
        element: <Forbidden />,
      },

      // ==================== Counselor / Admin ====================
      {
        element: <RoleRoute allowedRoles={["ADMIN", "COUNSELOR"]} />,
        children: [
          { path: "booklets", element: <BookletBuilder /> },
          { path: "booklet-builder", element: <BookletBuilder /> },
          { path: "booklet-builder/:id", element: <BookletBuilder /> },
          { path: "exam-builder", element: <ExamBuilder /> },
          { path: "exam-builder/:id", element: <ExamBuilder /> },
          {
            path: "dashboard/counselor/students",
            element: <StudentsList />,
          },
          {
            path: "dashboard/counselor/students/:id",
            element: <StudentDetail />,
          },
          {
            path: "dashboard/counselor/students/:studentId/plans/new",
            element: <StudyPlanEditor />,
          },
          {
            path: "dashboard/counselor/plans/:planId/edit",
            element: <StudyPlanEditor />,
          },
          {
            path: "dashboard/counselor/plans/:planId/exam-builder",
            element: <PersonalExamBuilder />,
          },
        ],
      },

      // ==================== Question Designer / Admin ====================
      {
        element: <RoleRoute allowedRoles={["ADMIN", "QUESTION_DESIGNER"]} />,
        children: [
          { path: "question-bank", element: <QuestionBank /> },
          { path: "question-analytics", element: <QuestionAnalyticsPage /> },
          { path: "question-import", element: <QuestionImport /> },
          { path: "question-designer", element: <QuestionDesigner /> },
          { path: "question-designer/:id", element: <QuestionDesigner /> },
        ],
      },

      // ==================== 404 ====================
      {
        path: "*",
        loader: () => {
          throw new Response("Not Found", { status: 404 });
        },
        element: <ErrorPage />,
      },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
