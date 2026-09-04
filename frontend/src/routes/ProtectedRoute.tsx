import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoading from "../components/common/PageLoading";
const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return <PageLoading />;
  }

  if (!token) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
