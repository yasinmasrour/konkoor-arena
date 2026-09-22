import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LockedFeature from "../../pages/LockedFeature";

interface FeatureGuardProps {
  feature: string;
  children?: React.ReactNode;
}

const FeatureGuard = ({ feature, children }: FeatureGuardProps) => {
  const { hasFeature, user, loading } = useAuth();

  console.log("FeatureGuard:", {
    feature,
    hasUser: !!user,
    loading,
    hasFeature: user ? hasFeature(feature) : false,
  });

  // ⏳ هنوز auth لود نشده
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--griffin-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  // 🔹 اگه لاگین نکرده → بذار ProtectedRoute هندل کنه
  if (!user) {
    return children ? <>{children}</> : <Outlet />;
  }

  // 🔹 چک feature
  if (!hasFeature(feature)) {
    return <LockedFeature feature={feature} />;
  }

  // ✅ دسترسی داره → children یا Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default FeatureGuard;