import { useMemo } from "react";

interface SecurityWatermarkProps {
  text: string;
  opacity?: number;
}

/**
 * واترمارک امنیتی — شبکه‌ای از متن چرخیده
 * کاربر اگه اسکرین‌شات بگیره، هویتش لو میره
 */
const SecurityWatermark = ({
  text,
  opacity = 0.05,
}: SecurityWatermarkProps) => {
  // 🔹 چیدمان واترمارک‌ها (شبکه‌ای)
  const watermarkItems = useMemo(() => {
    const items: Array<{ id: string; top: string; left: string }> = [];
    const cols = 3;
    const rows = 5;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 🔹 آفست برای پوشش بهتر
        const offsetTop = row % 2 === 0 ? 0 : 50 / cols;
        items.push({
          id: `${row}-${col}`,
          top: `${(row / rows) * 100}%`,
          left: `${(col / cols) * 100 + offsetTop}%`,
        });
      }
    }

    return items;
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] select-none overflow-hidden"
      aria-hidden="true"
      style={{ opacity }}
    >
      {watermarkItems.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap font-heading text-xs sm:text-sm font-black text-white"
          style={{
            top: item.top,
            left: item.left,
            transform: "rotate(-30deg) translate(-50%, -50%)",
            transformOrigin: "center",
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default SecurityWatermark;
