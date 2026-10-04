import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import FeatureGuard from "../components/common/FeatureGuard";
import ErrorPage from "../components/common/ErrorPage";
import RoleRoute from "./RoleRoute";
import PageLoading from "../components/common/PageLoading";

// ==================== 🆕 Public (فوری) ====================
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

// ==================== 🆕 Lazy (کم‌استفاده‌تر یا سنگین) ====================
const Dashboard = lazy(() => import("../pages/Dashboard"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const Subscriptions = lazy(() => import("../pages/Subscriptions"));
const PaymentVerify = lazy(() => import("../pages/PaymentVerify"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Referral = lazy(() => import("../pages/Referral"));
const Strategy = lazy(() => import("../pages/Strategy"));

// Tests
const Tests = lazy(() => import("../pages/Tests"));
const ExamDetail = lazy(() => import("../pages/ExamDetail"));
const Attempt = lazy(() => import("../pages/Attempt"));
const AttemptResult = lazy(() => import("../pages/AttemptResult"));
const AttemptReview = lazy(() => import("../pages/AttemptReview"));

// Arena
const Arena = lazy(() => import("../pages/Arena"));
const Matchmaking = lazy(() => import("../pages/Arena/Matchmaking"));
const Match = lazy(() => import("../pages/Arena/Match"));
const ArenaProfile = lazy(() => import("../pages/Arena/ArenaProfile"));
const ArenaHistory = lazy(() => import("../pages/Arena/ArenaHistory"));
const ArenaRanking = lazy(() => import("../pages/Arena/ArenaRanking"));
const ArenaSeasonResults = lazy(
  () => import("../pages/Arena/ArenaSeasonResults"),
);
const InviteAccept = lazy(() => import("../pages/Arena/InviteAccept"));

// Solo
const SoloSetup = lazy(() => import("../pages/Solo/SoloSetup"));
const SoloMatch = lazy(() => import("../pages/Solo/SoloMatch"));
const SoloResult = lazy(() => import("../pages/Solo/SoloResult"));
const SoloHistory = lazy(() => import("../pages/Solo/SoloHistory"));
const SoloStats = lazy(() => import("../pages/Solo/SoloStats"));

// Questions (سنگین!)
const QuestionBank = lazy(() => import("../pages/Questions/QuestionBank"));
const QuestionAnalyticsPage = lazy(
  () => import("../pages/Questions/QuestionAnalytics"),
);
const QuestionImport = lazy(() => import("../pages/Questions/QuestionImport"));
const QuestionDesigner = lazy(
  () => import("../pages/Questions/QuestionDesigner"),
);
const QuestionReview = lazy(() => import("../pages/Questions/QuestionReview"));

// 🆕 Builders (سنگین‌ترین‌ها!)
const ExamBuilder = lazy(() => import("../pages/ExamBuilder"));
const BookletBuilder = lazy(
  () => import("../pages/Booklets/BookletBuilder"),
);

// Blog
const BlogList = lazy(() => import("../pages/Blog/BlogList"));
const BlogPost = lazy(() => import("../pages/Blog/BlogPost"));
const BlogEditor = lazy(() => import("../pages/Blog/BlogEditor"));
const MyBlogPosts = lazy(() => import("../pages/Blog/MyBlogPosts"));
const AdminBlog = lazy(() => import("../pages/Admin/AdminBlog"));
const AdminBlogComments = lazy(
  () => import("../pages/Admin/AdminBlogComments"),
);

// Study Plans
const MyStudyPlans = lazy(() => import("../pages/StudyPlan/MyStudyPlans"));
const StudyPlanDetail = lazy(
  () => import("../pages/StudyPlan/StudyPlanDetail"),
);

// Personal Exam
const PersonalExam = lazy(() => import("../pages/PersonalExam/PersonalExam"));
const PersonalExamResult = lazy(
  () => import("../pages/PersonalExam/PersonalExamResult"),
);

// Counselor
const StudentsList = lazy(() => import("../pages/Counselor/StudentsList"));
const StudentDetail = lazy(() => import("../pages/Counselor/StudentDetail"));
const StudyPlanEditor = lazy(
  () => import("../pages/Counselor/StudyPlanEditor"),
);
const PersonalExamBuilder = lazy(
  () => import("../pages/Counselor/PersonalExamBuilder"),
);

// Admin
const WithdrawRequests = lazy(
  () => import("../pages/Admin/WithdrawRequests"),
);
const ArenaLeagues = lazy(() => import("../pages/Admin/ArenaLeagues"));
const AdminComments = lazy(() => import("../pages/Admin/AdminComments"));
const AdminStrategyPlans = lazy(
  () => import("../pages/Admin/AdminStrategyPlans"),
);
const StrategyPlanEditor = lazy(
  () => import("../pages/Admin/StrategyPlanEditor"),
);
const AdminSubscriptionPlans = lazy(
  () => import("../pages/Admin/AdminSubscriptionPlans"),
);
const SiteInfoPanel = lazy(
  () => import("../components/dashboard/panels/admin/SiteInfoPanel"),
);

// Public (سبک)
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Terms = lazy(() => import("../pages/Terms"));
const Privacy = lazy(() => import("../pages/Privacy"));
const FAQ = lazy(() => import("../pages/FAQ"));
const Forbidden = lazy(() => import("../pages/Forbidden"));

// Temp
const StudySchedule = lazy(() => import("../pages/Temp/StudySchedule"));

// ==================== 🆕 Wrapper ====================
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

// ==================== Router ====================
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
          { path: "forgot-password", element: withSuspense(ForgotPassword) },
        ],
      },

      // ==================== Protected (عمومی) ====================
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: withSuspense(Dashboard) },
          { path: "subscriptions", element: withSuspense(Subscriptions) },
          { path: "payment/verify", element: withSuspense(PaymentVerify) },
          { path: "notifications", element: withSuspense(Notifications) },
          { path: "referral", element: withSuspense(Referral) },
          { path: "strategy", element: withSuspense(Strategy) },

          {
            path: "dashboard/blog/new",
            element: withSuspense(BlogEditor),
          },
          {
            path: "dashboard/blog/:id/edit",
            element: withSuspense(BlogEditor),
          },
          {
            path: "dashboard/my-blog-posts",
            element: withSuspense(MyBlogPosts),
          },

          {
            path: "dashboard/study-plans",
            element: withSuspense(MyStudyPlans),
          },
          {
            path: "dashboard/study-plans/:id",
            element: withSuspense(StudyPlanDetail),
          },

          {
            element: <FeatureGuard feature="study-plans" />,
            children: [
              {
                path: "dashboard/personal-exams/:id",
                element: withSuspense(PersonalExam),
              },
              {
                path: "dashboard/personal-exams/:id/result",
                element: withSuspense(PersonalExamResult),
              },
            ],
          },
        ],
      },

      // ==================== Admin Only ====================
      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "question-review",
            element: withSuspense(QuestionReview),
          },
          {
            path: "admin/withdraw-requests",
            element: withSuspense(WithdrawRequests),
          },
          {
            path: "admin/arena/leagues",
            element: withSuspense(ArenaLeagues),
          },
          {
            path: "admin/comments",
            element: withSuspense(AdminComments),
          },
          {
            path: "admin/strategy-plans",
            element: withSuspense(AdminStrategyPlans),
          },
          {
            path: "admin/strategy-plans/new",
            element: withSuspense(StrategyPlanEditor),
          },
          {
            path: "admin/strategy-plans/:id/edit",
            element: withSuspense(StrategyPlanEditor),
          },
          { path: "admin/blog", element: withSuspense(AdminBlog) },
          { path: "admin/blog/new", element: withSuspense(BlogEditor) },
          {
            path: "admin/blog/comments",
            element: withSuspense(AdminBlogComments),
          },
          {
            path: "admin/blog/:id/edit",
            element: withSuspense(BlogEditor),
          },
          {
            path: "admin/subscription-plans",
            element: withSuspense(AdminSubscriptionPlans),
          },
          {
            path: "admin/site-info",
            element: withSuspense(SiteInfoPanel),
          },
        ],
      },

      // ==================== آزمون‌ها ====================
      { path: "tests", element: withSuspense(Tests) },
      { path: "tests/:id", element: withSuspense(ExamDetail) },
      { path: "attempts/:attemptId", element: withSuspense(Attempt) },
      { path: "attempts/:id/result", element: withSuspense(AttemptResult) },
      { path: "attempts/:id/review", element: withSuspense(AttemptReview) },

      // ==================== عمومی ====================
      { path: "about", element: withSuspense(About) },
      { path: "contact", element: withSuspense(Contact) },
      { path: "temp/schedule", element: withSuspense(StudySchedule) },
      { path: "terms", element: withSuspense(Terms) },
      { path: "privacy", element: withSuspense(Privacy) },
      { path: "faq", element: withSuspense(FAQ) },
      { path: "blog", element: withSuspense(BlogList) },
      { path: "blog/:slug", element: withSuspense(BlogPost) },

      // ==================== Protected (آرنا و بازی انفرادی) ====================
      {
        element: <ProtectedRoute />,
        children: [
          { path: "arena", element: withSuspense(Arena) },
          {
            path: "arena/ranking/:leagueId",
            element: withSuspense(ArenaRanking),
          },

          {
            element: <FeatureGuard feature="arena" />,
            children: [
              {
                path: "arena/profile",
                element: withSuspense(ArenaProfile),
              },
              {
                path: "arena/history",
                element: withSuspense(ArenaHistory),
              },
              {
                path: "arena/season/:leagueId",
                element: withSuspense(ArenaSeasonResults),
              },
              {
                path: "arena/leagues/:leagueId",
                element: withSuspense(Matchmaking),
              },
              { path: "arena/match/:matchId", element: withSuspense(Match) },
              {
                path: "arena/invite/:code",
                element: withSuspense(InviteAccept),
              },
            ],
          },

          {
            element: <FeatureGuard feature="solo" />,
            children: [
              { path: "solo/setup", element: withSuspense(SoloSetup) },
              { path: "solo/:id", element: withSuspense(SoloMatch) },
              {
                path: "solo/:id/result",
                element: withSuspense(SoloResult),
              },
              { path: "solo/history", element: withSuspense(SoloHistory) },
              { path: "solo/stats", element: withSuspense(SoloStats) },
            ],
          },
        ],
      },

      { path: "403", element: withSuspense(Forbidden) },

      // ==================== Counselor / Admin ====================
      {
        element: <RoleRoute allowedRoles={["ADMIN", "COUNSELOR"]} />,
        children: [
          { path: "booklets", element: withSuspense(BookletBuilder) },
          { path: "booklet-builder", element: withSuspense(BookletBuilder) },
          {
            path: "booklet-builder/:id",
            element: withSuspense(BookletBuilder),
          },
          { path: "exam-builder", element: withSuspense(ExamBuilder) },
          {
            path: "exam-builder/:id",
            element: withSuspense(ExamBuilder),
          },
          {
            path: "dashboard/counselor/students",
            element: withSuspense(StudentsList),
          },
          {
            path: "dashboard/counselor/students/:id",
            element: withSuspense(StudentDetail),
          },
          {
            path: "dashboard/counselor/students/:studentId/plans/new",
            element: withSuspense(StudyPlanEditor),
          },
          {
            path: "dashboard/counselor/plans/:planId/edit",
            element: withSuspense(StudyPlanEditor),
          },
          {
            path: "dashboard/counselor/plans/:planId/exam-builder",
            element: withSuspense(PersonalExamBuilder),
          },
        ],
      },

      // ==================== Question Designer / Admin ====================
      {
        element: <RoleRoute allowedRoles={["ADMIN", "QUESTION_DESIGNER"]} />,
        children: [
          { path: "question-bank", element: withSuspense(QuestionBank) },
          {
            path: "question-analytics",
            element: withSuspense(QuestionAnalyticsPage),
          },
          {
            path: "question-import",
            element: withSuspense(QuestionImport),
          },
          {
            path: "question-designer",
            element: withSuspense(QuestionDesigner),
          },
          {
            path: "question-designer/:id",
            element: withSuspense(QuestionDesigner),
          },
        ],
      },

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