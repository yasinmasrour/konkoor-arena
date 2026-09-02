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

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
        path: "/arena",
        element: <Arena />,
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
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
