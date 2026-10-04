import {
  ArrowUp,
  BookOpen,
  Mail,
  MapPin,
  Phone,
  Heart,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteInfo } from "../../hooks/useSiteInfo";
import EnamadBadge from "../common/EnamadBadge";

// ==================== Social Icons (SVG) ====================
interface IconProps {
  size?: number;
}

const InstagramIcon = ({ size = 18 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TelegramIcon = ({ size = 18 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 4.5 2.5 12l5.5 2 2 6 3-4 6 4z" />
    <path d="M8 14l10-8-6 10" />
  </svg>
);

const AparatIcon = ({ size = 18 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <circle cx="12" cy="12" r="7" />
  </svg>
);

// ==================== Data ====================
const productLinks = [
  { label: "آزمون‌ها", href: "/tests" },
  { label: "آرنا", href: "/arena" },
  { label: "بازی انفرادی", href: "/solo/setup" },
  { label: "اشتراک‌ها", href: "/subscriptions" },
  { label: "برنامه راهبردی", href: "/strategy" },
];

const companyLinks = [
  { label: "درباره ما", href: "/about" },
  { label: "وبلاگ", href: "/blog" },
  { label: "تماس با ما", href: "/contact" },
  { label: "دعوت دوستان", href: "/referral" },
  { label: "داشبورد", href: "/dashboard" },
];

const legalLinks = [
  { label: "قوانین و مقررات", href: "/terms" },
  { label: "حریم خصوصی", href: "/privacy" },
  { label: "سوالات متداول", href: "/faq" },
];

// ==================== کامپوننت ====================
const Footer = () => {
  const { siteInfo } = useSiteInfo();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  // 🆕 شبکه‌های اجتماعی از API
  const socialLinks = [
    siteInfo.instagramUrl && {
      icon: InstagramIcon,
      href: siteInfo.instagramUrl,
      label: "اینستاگرام",
      color:
        "hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500",
    },
    siteInfo.telegramUrl && {
      icon: TelegramIcon,
      href: siteInfo.telegramUrl,
      label: "تلگرام",
      color: "hover:bg-sky-500",
    },
    siteInfo.aparatUrl && {
      icon: AparatIcon,
      href: siteInfo.aparatUrl,
      label: "آپارات",
      color: "hover:bg-red-500",
    },
  ].filter(Boolean) as Array<{
    icon: ({ size }: IconProps) => React.ReactElement;
    href: string;
    label: string;
    color: string;
  }>;

  return (
    <footer className="relative mt-24 overflow-hidden bg-[#080B12] text-white">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-b from-[var(--griffin-gold)]/5 via-transparent to-purple-600/5 pointer-events-none" />

      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* ===== ستون ۱: برند + شبکه‌ها ===== */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-40" />
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 flex items-center justify-center shadow-lg">
                  <BookOpen size={22} strokeWidth={2.4} />
                </div>
              </div>
              <div>
                <p className="font-heading text-xl font-black text-white">
                  گریفین
                </p>
                <p className="text-[10px] text-[var(--griffin-gold)] tracking-widest">
                  GRIFFIN ACADEMY
                </p>
              </div>
            </div>

            {/* 🆕 توضیحات از API */}
            {siteInfo.aboutShort && (
              <p className="text-sm leading-7 text-gray-400 max-w-md">
                {siteInfo.aboutShort}
              </p>
            )}

            {/* شبکه‌های اجتماعی */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                  ما را دنبال کن
                </p>
                <div className="flex gap-2 flex-wrap">
                  {socialLinks.map((social, i) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        title={social.label}
                        className={`
                          group relative w-10 h-10 rounded-xl
                          bg-white/5 border border-white/10
                          flex items-center justify-center
                          text-gray-400
                          transition-colors duration-300
                          hover:border-transparent hover:text-white
                          ${social.color}
                        `}
                      >
                        <Icon size={17} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===== ستون ۲: محصولات ===== */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading text-sm font-black text-white">
              محصولات
            </h3>
            <ul className="space-y-2.5">
              {productLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors duration-200 hover:text-[var(--griffin-gold)]"
                  >
                    <span className="w-0 h-px bg-[var(--griffin-gold)] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== ستون ۳: شرکت ===== */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading text-sm font-black text-white">شرکت</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors duration-200 hover:text-[var(--griffin-gold)]"
                  >
                    <span className="w-0 h-px bg-[var(--griffin-gold)] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== ستون ۴: تماس ===== */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-heading text-sm font-black text-white">
              با ما در تماس باش
            </h3>

            <ul className="space-y-3 text-sm">
              {/* 🆕 ایمیل اصلی */}
              {siteInfo.emailMain && (
                <li>
                  <a
                    href={`mailto:${siteInfo.emailMain}`}
                    className="group flex items-center gap-3 text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--griffin-gold)] transition-colors group-hover:border-[var(--griffin-gold)]/40 shrink-0">
                      <Mail size={15} />
                    </div>
                    <span className="text-xs break-all" dir="ltr">
                      {siteInfo.emailMain}
                    </span>
                  </a>
                </li>
              )}

              {/* 🆕 تلفن ثابت */}
              {siteInfo.phoneFixed && (
                <li>
                  <a
                    href={`tel:${siteInfo.phoneFixed.replace(/\D/g, "")}`}
                    className="group flex items-center gap-3 text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--griffin-gold)] transition-colors group-hover:border-[var(--griffin-gold)]/40 shrink-0">
                      <Phone size={15} />
                    </div>
                    <span className="text-xs">{siteInfo.phoneFixed}</span>
                  </a>
                </li>
              )}

              {/* 🆕 آدرس */}
              {siteInfo.address && (
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--griffin-gold)] shrink-0">
                    <MapPin size={15} />
                  </div>
                  <span className="text-xs">{siteInfo.address}</span>
                </li>
              )}
            </ul>

            {/* 🆕 Enamad */}
            {siteInfo.enamadEnabled && siteInfo.enamadHtml && (
              <div className="pt-2">
                <EnamadBadge />
              </div>
            )}
          </div>
        </div>

        {/* خط جداکننده */}
        <div className="relative my-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--griffin-gold)] shadow-lg shadow-[var(--griffin-gold)]/50" />
        </div>

        {/* بخش پایین */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 text-center lg:text-right order-3 lg:order-1 flex-wrap justify-center">
            <span>© {currentYear} آکادمی گریفین</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>تمامی حقوق محفوظ است</span>
            <span className="inline-flex items-center gap-1 text-[var(--griffin-gold)]/70">
              ساخته‌شده با
              <Heart size={11} fill="currentColor" className="text-rose-500" />
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500 order-2">
            {legalLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-5">
                <Link
                  to={link.href}
                  className="hover:text-[var(--griffin-gold)] transition-colors"
                >
                  {link.label}
                </Link>
                {i < legalLinks.length - 1 && (
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={scrollToTop}
            aria-label="بازگشت به بالا"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-gray-400 hover:text-white hover:bg-[var(--griffin-gold)]/20 hover:border-[var(--griffin-gold)]/40 transition-colors duration-300 order-1 lg:order-3"
          >
            <ArrowUp
              size={14}
              className="transition-transform group-hover:-translate-y-0.5"
            />
            <span>بازگشت به بالا</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-600">
          <Sparkles size={11} className="text-[var(--griffin-gold)]/50" />
          <span className="tracking-widest uppercase">
            Griffin Academy · Konkoor Arena
          </span>
          <Sparkles size={11} className="text-[var(--griffin-gold)]/50" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
