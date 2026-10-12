import { useEffect, useState } from "react";

/**
 * تشخیص heading فعال بر اساس scroll
 * @param ids - لیست idهای heading
 * @param offset - فاصله از بالا (پیش‌فرض: 120)
 */
export const useScrollSpy = (ids: string[], offset = 120): string => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (ids.length === 0) return;

    const handleScroll = () => {
      let currentId = "";
      let minDistance = Infinity;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - offset);

        // اگه بالای viewport هست ولی نزدیک‌ترینه
        if (rect.top - offset <= 0 && distance < minDistance) {
          minDistance = distance;
          currentId = id;
        }
      }

      // اگه هیچی پیدا نشد، اولین id رو انتخاب کن
      if (!currentId && ids.length > 0) {
        const firstEl = document.getElementById(ids[0]);
        if (firstEl) {
          const rect = firstEl.getBoundingClientRect();
          if (rect.top < window.innerHeight / 2) {
            currentId = ids[0];
          }
        }
      }

      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [ids, offset]);

  return activeId;
};