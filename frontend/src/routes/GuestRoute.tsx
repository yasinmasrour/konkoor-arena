import { Navigate, Outlet } from "react-router-dom";
import PageLoading from "../components/common/PageLoading";
import { useAuth } from "../context/AuthContext";

const GuestRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
