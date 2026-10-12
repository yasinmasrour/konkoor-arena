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

interface AnnouncementBannerProps {
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

const AnnouncementBanner = ({
  announcement,
  onDismiss,
}: AnnouncementBannerProps) => {
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
        relative w-full overflow-hidden
        bg-white dark:bg-[#0a0d14]
        border-b border-gray-200 dark:border-white/[0.06]
        transition-all duration-500 ease-out
        ${
          isClosing
            ? "max-h-0 opacity-0 -translate-y-2"
            : "max-h-40 opacity-100 translate-y-0"
        }
      `}
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

      {/* هاله راست */}
      <div
        className="absolute -top-20 -right-10 w-72 h-72 rounded-full blur-3xl opacity-25 dark:opacity-20 pointer-events-none"
        style={{ backgroundColor: colors.hex }}
        aria-hidden
      />

      {/* هاله چپ */}
      <div
        className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full blur-3xl opacity-15 dark:opacity-10 pointer-events-none"
        style={{ backgroundColor: colors.soft }}
        aria-hidden
      />

      {/* محتوا */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* آیکون */}
          {announcement.icon && (
            <div
              className="
                shrink-0 hidden sm:flex
                w-10 h-10 rounded-xl
                items-center justify-center
                ring-1
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

          {/* محتوا */}
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm sm:text-[15px] font-black text-gray-900 dark:text-white leading-tight truncate">
              {announcement.title}
            </p>
            {announcement.message && (
              <p className="mt-0.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-5 line-clamp-2 sm:line-clamp-1">
                {announcement.message}
              </p>
            )}
          </div>

          {/* دکمه CTA */}
          {announcement.ctaText && announcement.ctaLink && (
            <button
              type="button"
              onClick={handleClick}
              className="
                group/btn shrink-0
                inline-flex items-center gap-1.5
                rounded-lg
                px-3.5 py-2
                text-[11px] sm:text-xs font-black
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
              <span className="hidden sm:inline">{announcement.ctaText}</span>
              <span className="sm:hidden">شروع</span>
              <ArrowLeft
                size={12}
                strokeWidth={2.5}
                className="rotate-180 transition-transform group-hover/btn:-translate-x-0.5"
              />
            </button>
          )}

          {/* دکمه بستن */}
          {announcement.dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="بستن اعلان"
              className="
                shrink-0 w-8 h-8 rounded-lg
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
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
