import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Scale,
  Ban,
  RefreshCcw,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RevealOnScroll from "../components/common/RevealOnScroll";

// ==================== Sections ====================
interface Section {
  id: string;
  title: string;
  icon: typeof FileText;
  content: string[];
  list?: string[];
}

const sections: Section[] = [
  {
    id: "intro",
    title: "مقدمه",
    icon: FileText,
    content: [
      "به آکادمی گریفین خوش آمدید. این سند، قوانین و مقررات استفاده از پلتفرم آموزشی گریفین (شامل وب‌سایت، اپلیکیشن، آزمون‌ها، آرنا و سایر خدمات) را تعیین می‌کند.",
      "با ثبت‌نام و استفاده از خدمات گریفین، شما تأیید می‌کنید که این قوانین را مطالعه کرده و می‌پذیرید. اگر با هر بخشی از این قوانین موافق نیستید، لطفاً از خدمات ما استفاده نکنید.",
    ],
  },
  {
    id: "definitions",
    title: "تعاریف",
    icon: CheckCircle2,
    content: [
      "برای شفافیت بیشتر، اصطلاحات کلیدی این سند به شرح زیر تعریف می‌شوند:",
    ],
    list: [
      "«پلتفرم» یا «گریفین»: وب‌سایت و خدمات آکادمی گریفین",
      "«کاربر»: هر شخصی که در گریفین ثبت‌نام کرده و از خدمات استفاده می‌کند",
      "«دانش‌آموز»: کاربری که برای شرکت در آزمون‌ها و دوره‌ها ثبت‌نام کرده است",
      "«مشاور»: کاربری که برنامه‌ریزی و مشاوره تحصیلی ارائه می‌دهد",
      "«آزمون»: آزمون‌های آزمایشی و آموزشی موجود در پلتفرم",
      "«آرنا»: بخش رقابت زنده بین دانش‌آموزان",
      "«اشتراک»: دسترسی به امکانات ویژه پلتفرم در بازه‌ی زمانی مشخص",
    ],
  },
  {
    id: "registration",
    title: "شرایط ثبت‌نام",
    icon: ShieldCheck,
    content: [
      "برای استفاده از خدمات گریفین، باید مراحل ثبت‌نام را کامل کنید. در این راستا، شما متعهد می‌شوید:",
    ],
    list: [
      "اطلاعات درست و دقیق وارد کنید (نام، شماره موبایل، ایمیل و...)",
      "شماره موبایل وارد شده متعلق به خودتان باشد",
      "از یک حساب کاربری برای استفاده شخصی بهره ببرید",
      "اطلاعات حساب خود را با دیگران به اشتراک نگذارید",
      "در صورت مشاهده هرگونه استفاده غیرمجاز، سریعاً به ما اطلاع دهید",
    ],
  },
  {
    id: "subscription",
    title: "اشتراک و پرداخت",
    icon: Scale,
    content: [
      "گریفین سه پلن اشتراک ارائه می‌دهد: برنزی، نقره‌ای و طلایی (VIP). با خرید هر اشتراک، به امکانات تعیین‌شده برای مدت یک سال دسترسی پیدا می‌کنید.",
      "شرایط پرداخت:",
    ],
    list: [
      "پرداخت‌ها از طریق درگاه‌های امن یا کیف پول داخلی انجام می‌شود",
      "پس از پرداخت، اشتراک بلافاصله فعال می‌شود",
      "در صورت لغو اشتراک، باقی‌مانده‌ی مبلغ به کیف پول شما بازمی‌گردد",
      "امکان خرید تکی آزمون‌ها (۳۰۰ هزار تومان) نیز وجود دارد",
      "قیمت‌ها ممکن است با اطلاع‌رسانی قبلی تغییر کنند",
    ],
  },
  {
    id: "exams",
    title: "قوانین آزمون‌ها",
    icon: CheckCircle2,
    content: [
      "آزمون‌های گریفین با استانداردهای کنکور طراحی شده‌اند و قوانین زیر باید رعایت شوند:",
    ],
    list: [
      "استفاده از هرگونه ابزار کمکی (ماشین‌حساب، جزوه و...) در آزمون ممنوع است",
      "خروج از آزمون و بازگشت، با محدودیت‌های زمانی همراه است",
      "در هر آزمون، فقط یک تلاش برای هر کاربر مجاز است",
      "تلاش برای تقلب یا دستکاری نتایج، منجر به مسدودسازی حساب می‌شود",
      "نتایج آزمون‌ها بلافاصله پس از ارسال، قابل مشاهده است",
    ],
  },
  {
    id: "arena",
    title: "قوانین آرنا و رقابت",
    icon: Scale,
    content: [
      "بخش آرنا به شما امکان رقابت زنده با دیگر دانش‌آموزان را می‌دهد. برای حفظ فضای سالم رقابت:",
    ],
    list: [
      "استفاده از هرگونه ربات یا اسکریپت خودکار ممنوع است",
      "ناسزاگویی و رفتار غیرمحترمانه منجر به اخطار و در نهایت مسدودسازی می‌شود",
      "نتایج آرنا بر اساس عملکرد شما در زمان پاسخ‌گویی محاسبه می‌شود",
      "تغییرات در سیستم امتیازدهی آرنا، حق گریفین است",
    ],
  },
  {
    id: "ip",
    title: "مالکیت معنوی",
    icon: FileText,
    content: [
      "تمام محتوای پلتفرم گریفین (شامل سوالات، جزوات، تصاویر، طراحی‌ها، لوگو، کد نرم‌افزاری و...) متعلق به آکادمی گریفین است و تحت قوانین مالکیت معنوی ایران محافظت می‌شود.",
      "شما مجاز به:",
    ],
    list: [
      "استفاده شخصی از محتوا برای یادگیری",
      "اشتراک‌گذاری لینک آزمون‌ها با دوستان",
    ],
  },
  {
    id: "refund",
    title: "لغو و بازگشت وجه",
    icon: RefreshCcw,
    content: ["سیاست بازگشت وجه گریفین به شرح زیر است:"],
    list: [
      "اشتراک: باقی‌مانده بر اساس روزهای استفاده‌نشده محاسبه و به کیف پول بازمی‌گردد",
      "خرید تکی آزمون: در صورت عدم شرکت در آزمون، تا ۲۴ ساعت بازگشت وجه ممکن است",
      "پس از شرکت در آزمون، امکان بازگشت وجه وجود ندارد",
      "درخواست بازگشت وجه از طریق پشتیبانی انجام می‌شود",
    ],
  },
  {
    id: "limitations",
    title: "محدودیت مسئولیت",
    icon: Ban,
    content: ["آکادمی گریفین تلاش می‌کند خدمات با کیفیت ارائه دهد، اما:"],
    list: [
      "مسئولیت قطعی سرویس به دلایل فنی، خارج از کنترل ما نیست",
      "مسئولیت محتوای کامنت‌های کاربران بر عهده‌ی خودشان است",
      "مسئولیت عدم دسترسی به دلیل مشکلات اینترنت کاربر، بر عهده‌ی کاربر است",
    ],
  },
  {
    id: "changes",
    title: "تغییرات در قوانین",
    icon: AlertCircle,
    content: [
      "آکادمی گریفین حق تغییر، به‌روزرسانی یا حذف بخشی از این قوانین را در هر زمان دارد. تغییرات مهم از طریق ایمیل یا اعلان در پلتفرم اطلاع‌رسانی می‌شود.",
      "ادامه‌ی استفاده از خدمات پس از اعمال تغییرات، به معنای پذیرش قوانین جدید است.",
    ],
  },
];

// ==================== Component ====================
const Terms = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("intro");

  // 🔹 تشخیص بخش فعال با اسکرول
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
        {/* ==================== Back ==================== */}
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

        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <header className="text-center space-y-5 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
              <FileText size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                TERMS OF SERVICE
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
              قوانین و{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                مقررات
              </span>
            </h1>

            <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8 text-sm md:text-base">
              لطفاً این قوانین را با دقت مطالعه کنید. استفاده از خدمات گریفین،
              به معنای پذیرش این شرایط است.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400">
              <span>آخرین به‌روزرسانی: ۱۴۰۴/۰۱/۰۱</span>
            </div>
          </header>
        </RevealOnScroll>

        {/* ==================== محتوا ==================== */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* 🆕 سایدبار TOC */}
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

          {/* 🆕 محتوای اصلی */}
          <div className="space-y-6">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <RevealOnScroll key={section.id} delay={i * 50}>
                  <section
                    id={section.id}
                    className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-8 scroll-mt-24"
                  >
                    {/* خط طلایی بالا */}
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/30 to-transparent" />

                    {/* هدر */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                        <Icon size={20} strokeWidth={2.3} />
                      </div>
                      <h2 className="font-heading text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>

                    {/* متن */}
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

            {/* ==================== تماس ==================== */}
            <RevealOnScroll>
              <div className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 p-6 md:p-8">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[60px] pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                    <Mail size={24} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white mb-1">
                      سوالی داری؟
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-7">
                      اگه در مورد قوانین سوالی داری، با پشتیبانی گریفین تماس
                      بگیر.
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

export default Terms;
