import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  Share2,
  UserCheck,
  Cookie,
  Mail,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RevealOnScroll from "../components/common/RevealOnScroll";

// ==================== Sections ====================
interface Section {
  id: string;
  title: string;
  icon: typeof ShieldCheck;
  content: string[];
  list?: string[];
}

const sections: Section[] = [
  {
    id: "intro",
    title: "مقدمه",
    icon: ShieldCheck,
    content: [
      "آکادمی گریفین به حفظ حریم خصوصی کاربران خود متعهد است. این سند توضیح می‌دهد که چه اطلاعاتی جمع‌آوری می‌کنیم، چگونه از آن‌ها استفاده می‌کنیم، و چه حقوقی نسبت به اطلاعات خود دارید.",
      "با استفاده از خدمات گریفین، شما با رویه‌های شرح داده‌شده در این سند موافقت می‌کنید.",
    ],
  },
  {
    id: "data-collected",
    title: "اطلاعاتی که جمع‌آوری می‌کنیم",
    icon: Database,
    content: ["برای ارائه خدمات بهتر، اطلاعات زیر را جمع‌آوری می‌کنیم:"],
    list: [
      "اطلاعات هویتی: نام، نام خانوادگی، شماره موبایل، ایمیل",
      "اطلاعات تحصیلی: پایه، رشته، معدل (اختیاری)",
      "اطلاعات پرداخت: مبلغ، تاریخ، درگاه پرداخت (اطلاعات کارت بانکی نزد ما ذخیره نمی‌شود)",
      "اطلاعات استفاده: آزمون‌های انجام‌شده، نتایج، زمان صرف‌شده",
      "اطلاعات فنی: IP، مرورگر، دستگاه (برای امنیت و بهبود خدمات)",
    ],
  },
  {
    id: "how-we-use",
    title: "نحوه استفاده از اطلاعات",
    icon: Eye,
    content: ["اطلاعات جمع‌آوری‌شده برای اهداف زیر استفاده می‌شود:"],
    list: [
      "ارائه و بهبود خدمات آموزشی",
      "تحلیل عملکرد تحصیلی و ارائه بازخورد شخصی‌سازی‌شده",
      "ارتباط با کاربر (اعلان‌ها، اطلاع‌رسانی آزمون‌ها، پاسخ به سوالات)",
      "پردازش پرداخت‌ها و مدیریت اشتراک‌ها",
      "تضمین امنیت و جلوگیری از تقلب",
      "بهبود تجربه کاربری و توسعه امکانات جدید",
    ],
  },
  {
    id: "cookies",
    title: "کوکی‌ها و فناوری‌های مشابه",
    icon: Cookie,
    content: [
      "گریفین از کوکی‌ها و localStorage برای موارد زیر استفاده می‌کند:",
    ],
    list: [
      "ذخیره توکن ورود برای جلوگیری از لاگین مکرر",
      "ذخیره تنظیمات کاربر (تم تاریک/روشن)",
      "ذخیره موقت پاسخ‌های آزمون در حال انجام",
      "تحلیل ناشناس رفتار کاربر (با ابزارهای تحلیلی)",
    ],
  },
  {
    id: "sharing",
    title: "اشتراک‌گذاری اطلاعات",
    icon: Share2,
    content: [
      "ما اطلاعات شخصی شما را به هیچ شخص ثالثی نمی‌فروشیم. اطلاعات فقط در موارد زیر به اشتراک گذاشته می‌شود:",
    ],
    list: [
      "با درگاه‌های پرداخت برای پردازش تراکنش‌ها (اطلاعات کارت نزد آن‌هاست)",
      "با سرویس‌های پیامک برای ارسال کد OTP",
      "با مراجع قانونی در صورت درخواست رسمی",
      "با مشاوران آموزشی شما (فقط اطلاعات تحصیلی مرتبط با برنامه‌ریزی)",
    ],
  },
  {
    id: "security",
    title: "امنیت داده‌ها",
    icon: Lock,
    content: [
      "امنیت اطلاعات کاربران برای ما بسیار مهم است. تدابیر امنیتی ما شامل:",
    ],
    list: [
      "استفاده از پروتکل HTTPS برای تمام ارتباطات",
      "رمزنگاری رمزهای عبور با الگوریتم bcrypt",
      "ذخیره توکن‌های امنیتی به‌صورت JWT با کلید مخفی قوی",
      "دسترسی محدود کارکنان به اطلاعات کاربران",
      "پشتیبان‌گیری منظم از داده‌ها",
      "لاگ‌گیری و نظارت بر فعالیت‌های غیرعادی",
    ],
  },
  {
    id: "rights",
    title: "حقوق کاربر",
    icon: UserCheck,
    content: ["شما نسبت به اطلاعات خود این حقوق را دارید:"],
    list: [
      "حق دسترسی: می‌توانید ببینید چه اطلاعاتی از شما ذخیره شده",
      "حق اصلاح: می‌توانید اطلاعات نادرست را تصحیح کنید",
      "حق حذف: می‌توانید درخواست حذف حساب کاربری و اطلاعات خود را بدهید",
      "حق انصراف: می‌توانید از دریافت ایمیل‌های تبلیغاتی انصراف دهید",
      "حق شکایت: می‌توانید در مورد نحوه پردازش داده‌ها به ما شکایت کنید",
    ],
  },
  {
    id: "children",
    title: "کاربران زیر ۱۸ سال",
    icon: ShieldCheck,
    content: [
      "آکادمی گریفین خدمات خود را برای دانش‌آموزان ارائه می‌دهد. برای کاربران زیر ۱۸ سال، توصیه می‌شود که ثبت‌نام و استفاده از خدمات با نظارت والدین یا سرپرست قانونی انجام شود.",
      "ما از والدین می‌خواهیم که در صورت مشاهده هرگونه فعالیت مشکوک، با پشتیبانی تماس بگیرند.",
    ],
  },
  {
    id: "changes",
    title: "تغییرات در سیاست حریم خصوصی",
    icon: ShieldCheck,
    content: [
      "آکادمی گریفین ممکن است این سیاست را در آینده به‌روزرسانی کند. تغییرات مهم از طریق ایمیل یا اعلان در پلتفرم به شما اطلاع داده می‌شود.",
      "ادامه‌ی استفاده از خدمات پس از اعمال تغییرات، به معنای پذیرش سیاست جدید است.",
    ],
  },
  {
    id: "contact",
    title: "اطلاعات تماس",
    icon: Mail,
    content: [
      "برای هرگونه سوال در مورد حریم خصوصی یا درخواست حذف اطلاعات، می‌توانید از طریق راه‌های زیر با ما تماس بگیرید:",
    ],
    list: [
      "ایمیل: info@griffin-academy.ir",
      "تلفن: ۰۲۱-۱۲۳۴۵۶۷۸",
      "صفحه تماس با ما در پلتفرم",
    ],
  },
];

// ==================== Component ====================
const Privacy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("intro");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors mb-6"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت
        </button>

        {/* هدر */}
        <RevealOnScroll>
          <header className="text-center space-y-5 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
              <ShieldCheck size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                PRIVACY POLICY
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
              حریم{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                خصوصی
              </span>
            </h1>

            <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8 text-sm md:text-base">
              امنیت و حریم خصوصی اطلاعات شما، اولویت اول ماست.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400">
              <span>آخرین به‌روزرسانی: ۱۴۰۴/۰۱/۰۱</span>
            </div>
          </header>
        </RevealOnScroll>

        {/* محتوا */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                فهرست مطالب
              </p>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollTo(section.id)}
                      className={`
                        w-full text-right px-3 py-2 rounded-xl
                        text-xs font-bold transition-colors
                        ${
                          isActive
                            ? "bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-6">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <RevealOnScroll key={section.id} delay={i * 50}>
                  <section
                    id={section.id}
                    className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-8 scroll-mt-24"
                  >
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/30 to-transparent" />

                    <div className="flex items-center gap-3 mb-5">
                      <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                        <Icon size={20} strokeWidth={2.3} />
                      </div>
                      <h2 className="font-heading text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>

                    <div className="space-y-4 text-sm md:text-base leading-8 text-gray-700 dark:text-gray-300">
                      {section.content.map((paragraph, j) => (
                        <p key={j}>{paragraph}</p>
                      ))}

                      {section.list && (
                        <ul className="space-y-2.5 mt-4">
                          {section.list.map((item, j) => (
                            <li key={j} className="flex items-start gap-3">
                              <div className="shrink-0 w-5 h-5 rounded-full bg-[var(--griffin-gold)]/15 flex items-center justify-center mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)]" />
                              </div>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                </RevealOnScroll>
              );
            })}

            {/* CTA */}
            <RevealOnScroll>
              <div className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 p-6 md:p-8">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[60px] pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                    <Mail size={24} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white mb-1">
                      حریم خصوصیت برات مهمه؟
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-7">
                      برای هر سوال یا درخواست حذف اطلاعات، با ما تماس بگیر.
                    </p>
                  </div>

                  <Link
                    to="/contact"
                    className="
                      group relative inline-flex items-center justify-center gap-2
                      rounded-xl
                      bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                      px-6 py-3
                      font-heading font-black text-white text-sm
                      shadow-lg shadow-[var(--griffin-gold)]/40
                      transition-transform duration-300
                      hover:-translate-y-0.5
                      overflow-hidden shrink-0
                    "
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Mail size={15} />
                      تماس با پشتیبانی
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
