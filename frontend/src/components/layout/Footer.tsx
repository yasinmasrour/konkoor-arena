// در بالای فایل Footer.tsx
const InstagramIcon = ({ size = 17 }: { size?: number }) => (
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

const TwitterIcon = ({ size = 17 }: { size?: number }) => (
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
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = ({ size = 17 }: { size?: number }) => (
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
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const LinkedinIcon = ({ size = 17 }: { size?: number }) => (
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 17 }: { size?: number }) => (
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
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
// ❌ این‌ها را حذف کنید:
// import { Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

// ✅ این‌ها را نگه دارید:
import { ArrowUp, BookOpen, Mail, MapPin, Phone, Send } from "lucide-react";

import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-[#080B12] text-white">
      {/* 🔹 گرادیان طلایی بالای footer */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

      {/* 🔹 گرادیان‌های پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--griffin-gold)]/5 via-transparent to-purple-600/5 pointer-events-none" />

      {/* 🔹 ذرات نورانی */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* 🔹 الگوی نقطه‌ای */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* 🔹 محتوای اصلی */}
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* ===== ستون برند ===== */}
          <div className="lg:col-span-4 space-y-5">
            {/* لوگو */}
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

            <p className="text-sm leading-7 text-gray-400 max-w-sm">
              آکادمی گریفین، پلتفرم هوشمند یادگیری، آزمون و رقابت برای
              دانش‌آموزان کنکوری. مسیر موفقیت را با ما تجربه کن.
            </p>

            {/* شبکه‌های اجتماعی */}
            <div className="flex gap-2 pt-2">
              {[
                { icon: InstagramIcon, href: "#", label: "اینستاگرام" },
                { icon: TwitterIcon, href: "#", label: "توییتر" },
                { icon: YoutubeIcon, href: "#", label: "یوتیوب" },
                { icon: LinkedinIcon, href: "#", label: "لینکدین" },
                { icon: GithubIcon, href: "#", label: "گیت‌هاب" },
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    aria-label={social.label}
                    className="group relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:bg-[var(--griffin-gold)] hover:border-[var(--griffin-gold)] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--griffin-gold)]/40"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ===== ستون لینک‌های سریع ===== */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading text-sm font-bold text-white">
              دسترسی سریع
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "صفحه اصلی", href: "/" },
                { label: "آزمون‌ها", href: "/exams" },
                { label: "Arena", href: "/arena" },
                { label: "بانک سوال", href: "/questions" },
                { label: "داشبورد", href: "/dashboard" },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="
                      group inline-flex items-center gap-1
                      text-sm text-gray-400
                      transition-colors duration-200
                      hover:text-[var(--griffin-gold)]
                    "
                  >
                    <span className="w-0 h-px bg-[var(--griffin-gold)] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== ستون خدمات ===== */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading text-sm font-bold text-white">
              خدمات ما
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "آزمون آنلاین", href: "#" },
                { label: "مشاوره تحصیلی", href: "#" },
                { label: "برنامه‌ریزی", href: "#" },
                { label: "تحلیل عملکرد", href: "#" },
                { label: "رتبه‌بندی", href: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="
                      group inline-flex items-center gap-1
                      text-sm text-gray-400
                      transition-colors duration-200
                      hover:text-[var(--griffin-gold)]
                    "
                  >
                    <span className="w-0 h-px bg-[var(--griffin-gold)] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== ستون خبرنامه و تماس ===== */}
          <div className="lg:col-span-4 space-y-5">
            <h3 className="font-heading text-sm font-bold text-white">
              با ما در تماس باش
            </h3>

            {/* اطلاعات تماس */}
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--griffin-gold)]">
                  <Mail size={14} />
                </div>
                <span>info@griffin-academy.ir</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--griffin-gold)]">
                  <Phone size={14} />
                </div>
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--griffin-gold)]">
                  <MapPin size={14} />
                </div>
                <span>تهران، ایران</span>
              </li>
            </ul>

            {/* فرم خبرنامه */}
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2">
                خبرنامه گریفین را دریافت کن
              </p>
              <form onSubmit={handleSubscribe} className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ایمیل خود را وارد کنید"
                  className="
                    w-full rounded-xl
                    bg-white/5
                    border border-white/10
                    px-4 py-3 pl-12
                    text-sm text-white
                    placeholder:text-gray-500
                    outline-none
                    transition-all duration-300
                    focus:border-[var(--griffin-gold)]
                    focus:bg-white/10
                    focus:shadow-lg
                    focus:shadow-[var(--griffin-gold)]/20
                  "
                />
                <button
                  type="submit"
                  aria-label="عضویت"
                  className="
                    absolute left-2 top-1/2 -translate-y-1/2
                    w-8 h-8 rounded-lg
                    bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600
                    flex items-center justify-center
                    text-white
                    transition-transform duration-300
                    hover:scale-110
                    shadow-lg shadow-[var(--griffin-gold)]/30
                  "
                >
                  <Send size={14} />
                </button>
              </form>

              {subscribed && (
                <p className="text-xs text-emerald-400 mt-2 animate-pulse">
                  ✅ با موفقیت عضو شدی!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===== خط جداکننده ===== */}
        <div className="relative my-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          {/* نقطه‌ی تزئینی وسط */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--griffin-gold)] shadow-lg shadow-[var(--griffin-gold)]/50" />
        </div>

        {/* ===== بخش پایین (کپی‌رایت و لینک‌های قانونی) ===== */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center md:text-right">
            © {currentYear} آکادمی گریفین — تمامی حقوق محفوظ است.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <a
              href="#"
              className="hover:text-[var(--griffin-gold)] transition-colors"
            >
              قوانین و مقررات
            </a>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <a
              href="#"
              className="hover:text-[var(--griffin-gold)] transition-colors"
            >
              حریم خصوصی
            </a>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <a
              href="#"
              className="hover:text-[var(--griffin-gold)] transition-colors"
            >
              تماس با ما
            </a>
          </div>

          {/* دکمه بازگشت به بالا */}
          <button
            onClick={scrollToTop}
            aria-label="بازگشت به بالا"
            className="
              group
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              bg-white/5
              border border-white/10
              text-xs text-gray-400
              hover:text-white
              hover:bg-[var(--griffin-gold)]/20
              hover:border-[var(--griffin-gold)]/40
              transition-all duration-300
            "
          >
            <ArrowUp
              size={14}
              className="transition-transform group-hover:-translate-y-0.5"
            />
            <span>بازگشت به بالا</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
