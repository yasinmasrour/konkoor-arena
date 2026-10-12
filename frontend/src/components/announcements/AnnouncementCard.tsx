/* eslint-disable react-hooks/static-components */
import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  trackAnnouncementClick,
  trackAnnouncementDismiss,
  getAnnouncementIcon,
  type Announcement,
} from "../../api/announcementApi";
import griffinMascot from "../../assets/mascot/griffin-announcement.webp";

interface AnnouncementCardProps {
  announcement: Announcement;
  onDismiss: () => void;
}

const VARIANT_HEX: Record<string, { hex: string; soft: string }> = {
  gold: { hex: "#f59e0b", soft: "#fbbf24" },
  red: { hex: "#f43f5e", soft: "#fb7185" },
  green: { hex: "#10b981", soft: "#34d399" },
  blue: { hex: "#3b82f6", soft: "#60a5fa" },
  purple: { hex: "#a855f7", soft: "#c084fc" },
  dark: { hex: "#64748b", soft: "#94a3b8" },
  // 🆕 جدید
  pink: { hex: "#ec4899", soft: "#f9a8d4" },
  orange: { hex: "#f97316", soft: "#fdba74" },
  cyan: { hex: "#06b6d4", soft: "#67e8f9" },
  indigo: { hex: "#6366f1", soft: "#a5b4fc" },
  rose: { hex: "#fb7185", soft: "#fda4af" },
  slate: { hex: "#64748b", soft: "#94a3b8" },
};

const AnnouncementCard = ({
  announcement,
  onDismiss,
}: AnnouncementCardProps) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const colors = VARIANT_HEX[announcement.variant] || VARIANT_HEX.gold;
  const Icon = getAnnouncementIcon(announcement.icon);

  const handleDismiss = () => {
    setIsClosing(true);
    if (announcement.dismissible) {
      void trackAnnouncementDismiss(announcement.id);
    }
    setTimeout(() => onDismiss(), 400);
  };

  const handleClick = () => {
    if (!announcement.ctaLink) return;
    void trackAnnouncementClick(announcement.id);

    if (announcement.ctaLink.startsWith("/")) {
      navigate(announcement.ctaLink);
    } else {
      window.open(announcement.ctaLink, "_blank", "noopener");
    }
  };

  return (
    <div
      className={`
        fixed bottom-4 left-4 z-40
        w-[360px] max-w-[calc(100vw-2rem)]
        transition-all duration-500 ease-out
        ${
          isClosing
            ? "translate-y-8 opacity-0 scale-95"
            : "translate-y-0 opacity-100 scale-100"
        }
      `}
      style={{
        animation: isClosing
          ? undefined
          : "slideUpFromBottom 0.5s cubic-bezier(0.2, 0.9, 0.2, 1)",
      }}
    >
      <div
        className="
          relative rounded-2xl overflow-hidden
          bg-white dark:bg-[#0a0d14]
          border border-gray-200 dark:border-white/[0.08]
          shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15),0_4px_12px_-4px_rgba(0,0,0,0.08)]
          dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5),0_4px_12px_-4px_rgba(0,0,0,0.3)]
        "
      >
        {/* الگوی گرید */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
            color: "rgba(148, 163, 184, 0.08)",
          }}
          aria-hidden
        />

        {/* هاله بزرگ راست-بالا */}
        <div
          className="absolute -top-16 -right-10 w-48 h-48 rounded-full blur-3xl opacity-60 dark:opacity-50 pointer-events-none"
          style={{ backgroundColor: colors.hex }}
          aria-hidden
        />

        {/* هاله کوچک چپ-پایین */}
        <div
          className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full blur-3xl opacity-50 dark:opacity-40 pointer-events-none"
          style={{ backgroundColor: colors.soft }}
          aria-hidden
        />

        {/* دکمه بستن */}
        {announcement.dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="بستن"
            className="
              absolute top-3 left-3 z-20
              w-7 h-7 rounded-lg
              flex items-center justify-center
              text-gray-400 dark:text-gray-500
              hover:text-gray-700 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-white/5
              transition-colors duration-200
            "
          >
            <X size={14} strokeWidth={2.3} />
          </button>
        )}

        {/* محتوا — دو ستونه */}
        <div className="relative flex items-stretch min-h-[152px]">
          {/* محتوا (راست) */}
          <div className="flex-1 p-5 flex flex-col justify-center gap-3 min-w-0">
            {/* آیکون */}
            {announcement.icon && (
              <div
                className="
                  shrink-0 self-start
                  w-10 h-10 rounded-xl
                  flex items-center justify-center
                  backdrop-blur-sm
                "
                style={{
                  backgroundColor: `${colors.hex}1A`,
                  color: colors.hex,
                  boxShadow: `inset 0 0 0 1px ${colors.hex}30`,
                }}
              >
                <Icon size={18} strokeWidth={2.3} />
              </div>
            )}

            {/* عنوان */}
            <h3 className="font-heading text-[14px] font-black text-gray-900 dark:text-white leading-5">
              {announcement.title}
            </h3>

            {/* پیام */}
            {announcement.message && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-5 line-clamp-2">
                {announcement.message}
              </p>
            )}

            {/* دکمه */}
            {announcement.ctaText && announcement.ctaLink && (
              <button
                type="button"
                onClick={handleClick}
                className="
                  group/btn mt-1 self-start
                  inline-flex items-center gap-1.5
                  rounded-lg
                  px-3.5 py-2
                  text-[11px] font-black
                  backdrop-blur-sm
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-lg
                "
                style={{
                  backgroundColor: `${colors.hex}1A`,
                  color: colors.hex,
                  boxShadow: `inset 0 0 0 1px ${colors.hex}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.hex}30`;
                  e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${colors.hex}60, 0 4px 12px ${colors.hex}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.hex}1A`;
                  e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${colors.hex}40`;
                }}
              >
                {announcement.ctaText}
                <ArrowLeft
                  size={11}
                  strokeWidth={2.5}
                  className="rotate-180 transition-transform group-hover/btn:-translate-x-0.5"
                />
              </button>
            )}
          </div>

          {/* ماسکوت (چپ) */}
          <div className="relative w-32 shrink-0">
            <img
              src={griffinMascot}
              alt=""
              className="
                absolute bottom-0 left-0
                w-40 h-40 object-contain
                drop-shadow-2xl
                pointer-events-none
              "
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;