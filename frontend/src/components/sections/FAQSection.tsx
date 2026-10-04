import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Sparkles,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import RevealOnScroll from "../common/RevealOnScroll";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: "register",
    category: "عمومی",
    question: "چطور توی گریفین ثبت‌نام کنم؟",
    answer:
      "فقط با شماره موبایل. روی دکمه «شروع کن» بزن، شماره‌ت رو وارد کن، کد تأیید (OTP) رو وارد کن و تمام. کل فرآیند کمتر از ۱ دقیقه طول می‌کشه و نیازی به کارت بانکی برای شروع نیست.",
  },
  {
    id: "subscription",
    category: "اشتراک",
    question: "اشتراک چطور کار می‌کنه؟",
    answer:
      "ما سه پلن داریم: برنزی (دسترسی به آزمون‌ها)، نقره‌ای (آزمون + آرنا + بازی انفرادی)، و طلایی VIP (همه‌چیز + برنامه مطالعاتی + تحلیل AI). با خرید هر پلن، امکانات مربوطه برای یک سال در اختیارت قرار می‌گیره.",
  },
  {
    id: "single-exam",
    category: "اشتراک",
    question: "می‌خوام فقط یه آزمون خاص شرکت کنم. اشتراک لازمه؟",
    answer:
      "نه! می‌تونی هر آزمون رو به صورت تکی هم بخری (۳۰۰ هزار تومان). با خرید تکی، به همون آزمون خاص و بخش کامنت‌هاش دسترسی پیدا می‌کنی.",
  },
  {
    id: "arena",
    category: "آرنا",
    question: "آرنا چیه و چطور کار می‌کنه؟",
    answer:
      "آرنا بخش رقابت زنده گریفینه. با دانش‌آموزان هم‌سطحت رقابت می‌کنی، جواب‌های سریع و درست می‌دی و در جدول رده‌بندی بالا می‌ری. برای شرکت در آرنا، نیاز به اشتراک نقره‌ای یا بالاتری داری.",
  },
  {
    id: "ai-analysis",
    category: "آزمون",
    question: "تحلیل AI چطور کار می‌کنه؟",
    answer:
      "بعد از هر آزمون، هوش مصنوعی عملکردت رو تحلیل می‌کنه: نقاط قوت و ضعفت رو نشون می‌ده، پیشنهادهای مطالعه اختصاصی ارائه می‌ده، و عملکردت رو با میانگین بقیه مقایسه می‌کنه. این قابلیت مخصوص اشتراک طلایی VIP هست.",
  },
  {
    id: "cancel",
    category: "اشتراک",
    question: "می‌تونم اشتراکم رو لغو کنم؟",
    answer:
      "بله. اگه اشتراک فعالت رو کنسل کنی، باقی‌مانده‌ی مبلغ به کیف پولت برمی‌گرده و می‌تونی ازش برای خرید مجدد یا آزمون تکی استفاده کنی.",
  },
];

const FAQSection = () => {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-40 right-1/3 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 mb-5">
              <HelpCircle size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                FAQ
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              سوالات{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  متداول
                </span>
                <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
              </span>
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-8">
              پرتکرارترین سوالات کاربران گریفین. اگه جوابت رو پیدا نکردی، با
              پشتیبانی تماس بگیر.
            </p>
          </div>
        </RevealOnScroll>

        {/* ==================== لیست سوالات ==================== */}
        <RevealOnScroll>
          <div className="space-y-3">
            {FAQS.map((faq) => {
              const isOpen = openId === faq.id;
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
                  {/* خط طلایی بالا (فقط باز) */}
                  {isOpen && (
                    <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />
                  )}

                  {/* سوال (قابل کلیک) */}
                  <button
                    type="button"
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-4 p-5 text-right"
                  >
                    {/* آیکون */}
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

                    {/* متن سوال */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="font-heading text-sm md:text-base font-black text-gray-900 dark:text-white leading-6">
                        {faq.question}
                      </h3>
                    </div>

                    {/* آیکون باز/بسته */}
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

                  {/* پاسخ (قابل باز/بسته) */}
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
        </RevealOnScroll>

        {/* ==================== CTA ==================== */}
        <RevealOnScroll delay={300}>
          <div className="mt-12 text-center space-y-5">
            {/* دکمه مشاهده همه */}
            <div>
              <Link
                to="/faq"
                className="
                  group relative inline-flex items-center justify-center gap-2
                  rounded-xl
                  bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                  px-7 py-3.5
                  font-heading font-black text-white text-sm
                  shadow-lg shadow-[var(--griffin-gold)]/40
                  transition-transform duration-300
                  hover:-translate-y-0.5
                  overflow-hidden
                "
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={16} />
                  مشاهده همه سوالات متداول
                  <ArrowLeft
                    size={14}
                    className="rotate-180 transition-transform group-hover:-translate-x-1"
                  />
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            </div>

            {/* متن پشتیبانی */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle
                  size={13}
                  className="text-[var(--griffin-gold)]"
                />
                جوابت رو پیدا نکردی؟
              </span>
              <Link
                to="/contact"
                className="font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
              >
                با پشتیبانی تماس بگیر
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default FAQSection;
