import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoading from "../components/common/PageLoading";

type RoleRouteProps = {
  allowedRoles: string[];
};

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoading />;
  if (!token) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
      />
    );
  }
  if (!user || !allowedRoles.includes(user.role.name)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
