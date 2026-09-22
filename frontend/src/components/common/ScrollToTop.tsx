import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 🔹 با هر تغییر مسیر، صفحه رو به بالا می‌بره
 * - توی MainLayout یا App اضافه کن
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;