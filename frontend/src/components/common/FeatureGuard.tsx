import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LockedFeature from "../../pages/LockedFeature";
import PageLoading from "./PageLoading";

interface FeatureGuardProps {
  feature: string;
  children?: React.ReactNode;
}

const FeatureGuard = ({ feature, children }: FeatureGuardProps) => {
  const { hasFeature, user, token, loading } = useAuth();
  const location = useLocation();

  // ⏳ هنوز auth لود نشده
  if (loading) {
    return <PageLoading />;
  }

  // 🔴 کاربر لاگین نکرده → برو به login
  if (!token || !user) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(
          `${location.pathname}${location.search}`,
        )}`}
        replace
        state={{ from: location }}
      />
    );
  }

  // 🟠 لاگین کرده ولی feature رو نداره → LockedFeature
  if (!hasFeature(feature)) {
    return <LockedFeature feature={feature} />;
  }

  // ✅ دسترسی داره
  return children ? <>{children}</> : <Outlet />;
};

export default FeatureGuard;