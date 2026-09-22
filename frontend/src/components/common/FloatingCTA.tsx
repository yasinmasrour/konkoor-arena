import { useEffect, useState } from "react";
import { ArrowLeft, Rocket, X } from "lucide-react";

const FloatingCTA = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !show) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-6 z-[150]
        transition-all duration-500
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >
      <div className="relative group">
        {/* هاله طلایی */}
        <div className="absolute inset-0 rounded-2xl bg-[var(--griffin-gold)] blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />

        <a
          href="/arena"
          className="
            relative flex items-center gap-3
            rounded-2xl
            bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
            px-5 py-3.5
            text-white font-bold
            shadow-2xl
            transition-transform duration-300
            hover:-translate-y-1
            overflow-hidden
          "
        >
          <Rocket size={20} />
          <span>شروع رقابت</span>
          <ArrowLeft size={16} />
        </a>

        {/* دکمه بستن */}
        <button
          onClick={() => setDismissed(true)}
          className="
            absolute -top-2 -right-2
            w-6 h-6 rounded-full
            bg-white text-gray-700
            flex items-center justify-center
            shadow-lg
            hover:bg-red-500 hover:text-white
            transition
          "
          aria-label="بستن"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default FloatingCTA;
