import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  Search,
  MessageCircle,
  Wallet,
  BookOpen,
  Swords,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RevealOnScroll from "../components/common/RevealOnScroll";
import Seo from "../components/common/Seo";

// ==================== Types ====================
interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

// ==================== Categories ====================
const CATEGORIES = [
  { key: "all", label: "همه", icon: HelpCircle },
  { key: "general", label: "عمومی", icon: UserPlus },
  { key: "subscription", label: "اشتراک و پرداخت", icon: Wallet },
  { key: "exams", label: "آزمون‌ها", icon: BookOpen },
  { key: "arena", label: "آرنا", icon: Swords },
  { key: "study-plans", label: "برنامه مطالعاتی", icon: ClipboardList },
];

// ==================== FAQs ====================
const FAQS: FAQ[] = [
  // ===== عمومی =====
  {
    id: "register",
    category: "general",
    question: "چطور توی گریفین ثبت‌نام کنم؟",
    answer:
      "فقط با شماره موبایل. روی دکمه «شروع کن» بزن، شماره‌ت رو وارد کن، کد تأیید (OTP) رو وارد کن و تمام. کل فرآیند کمتر از ۱ دقیقه طول می‌کشه و نیازی به کارت بانکی برای شروع نیست.",
  },
  {
    id: "forgot-password",
    category: "general",
    question: "اگه رمزم رو فراموش کردم چی؟",
    answer:
      "نگران نباش. توی صفحه ورود، شماره موبایلت رو وارد کن، کد تأیید برات پیامک می‌شه و می‌تونی وارد حساب بشی. اگه بازم مشکل داشتی، با پشتیبانی تماس بگیر.",
  },
  {
    id: "profile-complete",
    category: "general",
    question: "چرا باید پروفایلم رو تکمیل کنم؟",
    answer:
      "تکمیل پروفایل (پایه تحصیلی، رشته، هدف) به ما کمک می‌کنه تا محتوای مناسب‌تری برات نمایش بدیم و برنامه‌های مطالعاتی شخصی‌سازی‌شده‌تری داشته باشی. بعضی از امکانات مثل آرنا فقط بعد از تکمیل پروفایل فعال می‌شن.",
  },
  {
    id: "contact-support",
    category: "general",
    question: "اگه مشکلی داشتم چطور با پشتیبانی تماس بگیرم؟",
    answer:
      "از طریق صفحه «تماس با ما» می‌تونی تیکت بزنی یا با شماره پشتیبانی تماس بگیری. تیم پشتیبانی گریفین ۲۴/۷ آماده کمکت هست.",
  },

  // ===== اشتراک و پرداخت =====
  {
    id: "subscription",
    category: "subscription",
    question: "اشتراک چطور کار می‌کنه؟",
    answer:
      "ما سه پلن داریم: برنزی (دسترسی به آزمون‌ها)، نقره‌ای (آزمون + آرنا + بازی انفرادی)، و طلایی VIP (همه‌چیز + برنامه مطالعاتی + تحلیل AI). با خرید هر پلن، امکانات مربوطه برای یک سال در اختیارت قرار می‌گیره.",
  },
  {
    id: "single-exam",
    category: "subscription",
    question: "می‌خوام فقط یه آزمون خاص شرکت کنم. اشتراک لازمه؟",
    answer:
      "نه! می‌تونی هر آزمون رو به صورت تکی هم بخری (۳۰۰ هزار تومان). با خرید تکی، به همون آزمون خاص و بخش کامنت‌هاش دسترسی پیدا می‌کنی.",
  },
  {
    id: "upgrade",
    category: "subscription",
    question: "می‌تونم اشتراکم رو ارتقا بدم؟",
    answer:
      "بله! می‌تونی از پلن فعلی به پلن بالاتر ارتقا بدی. باقی‌مانده‌ی پلن فعلی به کیف پولت برمی‌گرده و پلن جدید بلافاصله فعال می‌شه.",
  },
  {
    id: "cancel",
    category: "subscription",
    question: "می‌تونم اشتراکم رو لغو کنم؟",
    answer:
      "بله. اگه اشتراک فعالت رو کنسل کنی، باقی‌مانده‌ی مبلغ به کیف پولت برمی‌گرده و می‌تونی ازش برای خرید مجدد یا آزمون تکی استفاده کنی.",
  },
  {
    id: "payment-methods",
    category: "subscription",
    question: "چه روش‌های پرداختی وجود داره؟",
    answer:
      "پرداخت آنلاین از طریق درگاه‌های بانکی، یا از طریق کیف پول داخلی گریفین. می‌تونی اول کیف پولت رو شارژ کنی و بعد از موجودی استفاده کنی.",
  },
  {
    id: "payment-security",
    category: "subscription",
    question: "پرداخت امنه؟",
    answer:
      "بله. همه پرداخت‌ها از طریق درگاه‌های امن انجام می‌شن. اطلاعات کارت بانکیت هرگز نزد ما ذخیره نمی‌شه.",
  },
  {
    id: "refund",
    category: "subscription",
    question: "اگه خریدم رو پس بگیرم چی؟",
    answer:
      "برای اشتراک‌ها، باقی‌مانده به کیف پولت برمی‌گرده. برای آزمون‌های تکی، اگه هنوز توی آزمون شرکت نکردی، می‌تونی از پشتیبانی درخواست بازگشت وجه کنی.",
  },

  // ===== آزمون‌ها =====
  {
    id: "how-exams-work",
    category: "exams",
    question: "آزمون‌ها چطور برگزار می‌شن؟",
    answer:
      "آزمون‌ها مثل کنکور واقعی، دفترچه‌ای هستن. هر دفترچه زمان مستقل داره. بعد از تموم شدن زمان یه دفترچه، خودکار به دفترچه بعدی می‌ری. بین دفترچه‌ها ۱۰ ثانیه استراحت هست.",
  },
  {
    id: "exam-negative",
    category: "exams",
    question: "آزمون‌ها نمره منفی دارن؟",
    answer:
      "بله، مثل کنکور واقعی. هر ۳ پاسخ غلط، ۱ نمره منفی داره. پس توصیه می‌کنیم سوالاتی که شک داری رو نزنی.",
  },
  {
    id: "exam-return",
    category: "exams",
    question: "می‌تونم به دفترچه‌ی قبلی برگردم؟",
    answer:
      "نه. بعد از تموم شدن زمان هر دفترچه، دیگه نمی‌تونی بهش برگردی. پس سعی کن توی هر دفترچه، تا آخرین لحظه بمونی.",
  },
  {
    id: "exam-attempts",
    category: "exams",
    question: "چند بار می‌تونم یه آزمون رو شرکت کنم؟",
    answer:
      "هر آزمون فقط یک بار. بعد از اتمام، نتیجه و تحلیل کامل در داشبوردت قابل مشاهده‌ست.",
  },
  {
    id: "ai-analysis",
    category: "exams",
    question: "تحلیل AI چطور کار می‌کنه؟",
    answer:
      "بعد از هر آزمون، هوش مصنوعی عملکردت رو تحلیل می‌کنه: نقاط قوت و ضعفت رو نشون می‌ده، پیشنهادهای مطالعه اختصاصی ارائه می‌ده، و عملکردت رو با میانگین بقیه مقایسه می‌کنه. این قابلیت مخصوص اشتراک طلایی VIP هست.",
  },

  // ===== آرنا =====
  {
    id: "arena",
    category: "arena",
    question: "آرنا چیه و چطور کار می‌کنه؟",
    answer:
      "آرنا بخش رقابت زنده گریفینه. با دانش‌آموزان هم‌سطحت رقابت می‌کنی، جواب‌های سریع و درست می‌دی و در جدول رده‌بندی بالا می‌ری. هر نبرد ۱۵ دقیقه‌ست و برنده بر اساس سرعت و دقت مشخص میشه.",
  },
  {
    id: "arena-required",
    category: "arena",
    question: "برای آرنا نیاز به اشتراک خاصی داره؟",
    answer:
      "بله. برای شرکت در آرنا، نیاز به اشتراک نقره‌ای یا بالاتری داری. اما می‌تونی لیگ‌ها و رتبه‌بندی رو بدون اشتراک هم ببینی.",
  },
  {
    id: "solo",
    category: "arena",
    question: "بازی انفرادی چیه؟",
    answer:
      "بازی انفرادی (Solo) بهت اجازه می‌ده بدون نیاز به حریف، مهارت‌هات رو در سه سطح دشواری (آسان، متوسط، سخت) محک بزنی. برای دسترسی، نیاز به اشتراک نقره‌ای یا بالاتری داری.",
  },
  {
    id: "arena-rating",
    category: "arena",
    question: "سیستم امتیازدهی آرنا چطوره؟",
    answer:
      "هر نبرد بر اساس نتیجه (برد/باخت) امتیاز مثبت یا منفی بهت می‌ده. هرچه سریع‌تر و دقیق‌تر جواب بدی، امتیاز بیشتری می‌گیری. در پایان فصل، جوایزی به برترین‌ها اهدا میشه.",
  },

  // ===== برنامه مطالعاتی =====
  {
    id: "study-plan",
    category: "study-plans",
    question: "برنامه مطالعاتی شخصی چیه؟",
    answer:
      "مشاورهای گریفین بر اساس سطح، هدف و زمان در اختیارت، یه برنامه مطالعاتی اختصاصی برات طراحی می‌کنن. تسک‌ها، آزمون‌های شخصی و پیشرفتت همه توی داشبوردت قابل مشاهده‌ست.",
  },
  {
    id: "study-plan-access",
    category: "study-plans",
    question: "برنامه مطالعاتی نیاز به اشتراک خاصی داره؟",
    answer: "بله، این امکان مخصوص اشتراک طلایی VIP هست.",
  },
  {
    id: "counselor",
    category: "study-plans",
    question: "چطور با مشاورم در ارتباط باشم؟",
    answer:
      "از طریق داشبوردت می‌تونی با مشاورت پیام رد و بدل کنی، سوال بپرسی و پیشرفتت رو با هم بررسی کنید.",
  },
  {
    id: "personal-exam",
    category: "study-plans",
    question: "آزمون شخصی چیه؟",
    answer:
      "مشاورت می‌تونه بر اساس برنامه‌ی مطالعاتی، یه آزمون اختصاصی از بانک سوال برات بسازه تا تسلطت رو بسنجی. نتیجه‌ی این آزمون‌ها به مشاورت کمک می‌کنه برنامه‌ت رو بهتر تنظیم کنه.",
  },
];

// ==================== Component ====================
const FAQ = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  // 🔹 فیلتر کردن
  const filtered = useMemo(() => {
    let result = FAQS;

    if (activeCategory !== "all") {
      result = result.filter((f) => f.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q),
      );
    }

    return result;
  }, [search, activeCategory]);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Seo
        title="سوالات متداول"
        description="پاسخ سوالات پرتکرار درباره اشتراک، آزمون‌ها، آرنا، برنامه مطالعاتی و..."
        url="https://griffinedu.ir/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }}
      />

      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-4xl mx-auto">
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
            <header className="text-center space-y-5 mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
                <HelpCircle size={14} className="text-[var(--griffin-gold)]" />
                <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                  FREQUENTLY ASKED
                </span>
              </div>

              <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                سوالات{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  متداول
                </span>
              </h1>

              <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

              <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8 text-sm md:text-base">
                هر سوالی داری، احتمالاً جوابش اینجاست. اگه نبود، پشتیبانی در
                دسترسه.
              </p>
            </header>
          </RevealOnScroll>

          {/* ==================== جستجو ==================== */}
          <RevealOnScroll>
            <div className="relative mb-5">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در سوالات..."
                className="
                  w-full rounded-2xl
                  border border-gray-200 dark:border-white/10
                  bg-white dark:bg-white/[0.03]
                  py-4 pr-12 pl-4
                  text-sm text-gray-900 dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  outline-none
                  focus:border-[var(--griffin-gold)]
                  focus:ring-2 focus:ring-[var(--griffin-gold)]/20
                  transition-colors
                "
              />
            </div>
          </RevealOnScroll>

          {/* ==================== دسته‌بندی ==================== */}
          <RevealOnScroll>
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.key);
                      setOpenId(null);
                    }}
                    className={`
                      inline-flex items-center gap-2
                      rounded-xl px-3.5 py-2
                      text-xs font-black
                      transition-colors duration-200
                      ${
                        isActive
                          ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                          : "border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    <Icon size={13} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </RevealOnScroll>

          {/* ==================== لیست ==================== */}
          <RevealOnScroll>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Search
                    size={26}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <p className="font-heading text-base font-black text-gray-500 dark:text-gray-400">
                  سوالی با این عنوان پیدا نشد
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  با کلمات دیگه‌ای جستجو کن یا با پشتیبانی تماس بگیر
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((faq) => {
                  const isOpen = openId === faq.id;
                  const categoryLabel =
                    CATEGORIES.find((c) => c.key === faq.category)?.label ||
                    faq.category;

                  return (
                    <div
                      key={faq.id}
                      className={`
                        group relative rounded-2xl overflow-hidden
                        border transition-colors duration-300
                        ${
                          isOpen
                            ? "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5"
                            : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[var(--griffin-gold)]/30"
                        }
                      `}
                    >
                      {isOpen && (
                        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />
                      )}

                      <button
                        type="button"
                        onClick={() => toggle(faq.id)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center gap-4 p-5 text-right"
                      >
                        <div
                          className={`
                            shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                            transition-colors duration-300
                            ${
                              isOpen
                                ? "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 text-white"
                                : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                            }
                          `}
                        >
                          <HelpCircle size={16} strokeWidth={2.3} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                              {categoryLabel}
                            </span>
                          </div>
                          <h3 className="font-heading text-sm md:text-base font-black text-gray-900 dark:text-white leading-6">
                            {faq.question}
                          </h3>
                        </div>

                        <div
                          className={`
                            shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                            transition-all duration-300
                            ${
                              isOpen
                                ? "bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] rotate-180"
                                : "bg-gray-100 dark:bg-white/5 text-gray-400"
                            }
                          `}
                        >
                          <ChevronDown size={16} strokeWidth={2.5} />
                        </div>
                      </button>

                      <div
                        className={`
                          grid transition-all duration-300 ease-out
                          ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }
                        `}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 pb-5 pr-[68px]">
                            <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </RevealOnScroll>

          {/* ==================== CTA پشتیبانی ==================== */}
          <RevealOnScroll delay={300}>
            <div className="mt-12">
              <div className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 p-8 text-center">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[60px] pointer-events-none" />

                <div className="relative">
                  <div className="relative inline-flex mb-5">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-40" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                      <MessageCircle size={24} strokeWidth={2.2} />
                    </div>
                  </div>

                  <h3 className="font-heading text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3">
                    جوابت رو پیدا نکردی؟
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-7 mb-6">
                    تیم پشتیبانی گریفین ۲۴/۷ آماده‌ست تا کمکت کنه.
                  </p>

                  <Link
                    to="/contact"
                    className="
                      group relative inline-flex items-center justify-center gap-2
                      rounded-xl
                      bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                      px-6 py-3.5
                      font-heading font-black text-white text-sm
                      shadow-lg shadow-[var(--griffin-gold)]/40
                      transition-transform duration-300
                      hover:-translate-y-0.5
                      overflow-hidden
                    "
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <MessageCircle size={16} />
                      تماس با پشتیبانی
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* 🆕 لینک به صفحات حقوقی */}
          <RevealOnScroll delay={400}>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                همچنین ببین:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
                >
                  قوانین و مقررات
                </Link>
                <span className="text-gray-400">·</span>
                <Link
                  to="/privacy"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
                >
                  حریم خصوصی
                </Link>
                <span className="text-gray-400">·</span>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
                >
                  تماس با ما
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </main>
    </>
  );
};

export default FAQ;
