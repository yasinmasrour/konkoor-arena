import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
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
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Forbidden from "../pages/Forbidden";
import Subscriptions from "../pages/Subscriptions";

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
          {
            path: "login",
            element: <Login />,
          },

          {
            path: "register",
            element: <Register />,
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "subscriptions",
            element: <Subscriptions />,
          },
        ],
      },

      {
        path: "tests",
        element: <Tests />,
      },
      {
        path: "/tests/:id",
        element: <ExamDetail />,
      },
      {
        path: "/attempts/:attemptId",
        element: <Attempt />,
      },
      {
        path: "/attempts/:id/result",
        element: <AttemptResult />,
      },
      {
        path: "/attempts/:id/review",
        element: <AttemptReview />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/arena",
            element: <Arena />,
          },
          {
            path: "/arena/profile",
            element: <ArenaProfile />,
          },
          {
            path: "/arena/history",
            element: <ArenaHistory />,
          },
          {
            path: "/arena/ranking/:leagueId",
            element: <ArenaRanking />,
          },
          {
            path: "/arena/season/:leagueId",
            element: <ArenaSeasonResults />,
          },
          {
            path: "/arena/leagues/:leagueId",
            element: <Matchmaking />,
          },
          {
            path: "/arena/match/:matchId",
            element: <Match />,
          },
        ],
      },
      {
        path: "403",
        element: <Forbidden />,
      },
      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,
        children: [{ path: "admin", element: <AdminDashboard /> }],
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
