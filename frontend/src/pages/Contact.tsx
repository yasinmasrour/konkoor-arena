import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import RevealOnScroll from "../components/common/RevealOnScroll";
import { useSiteInfo } from "../hooks/useSiteInfo";
import { createContactMessage } from "../api/contactApi";
import Seo from "../components/common/Seo";

const Contact = () => {
  const { siteInfo } = useSiteInfo();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    setSent(false);

    try {
      await createContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 اطلاعات تماس از API (با فیلتر کردن فیلدهای خالی)
  const contactInfo = [
    siteInfo.emailMain && {
      icon: Mail,
      title: "ایمیل",
      value: siteInfo.emailMain,
      href: `mailto:${siteInfo.emailMain}`,
    },
    siteInfo.phoneFixed && {
      icon: Phone,
      title: "تلفن",
      value: siteInfo.phoneFixed,
      href: `tel:${siteInfo.phoneFixed.replace(/\D/g, "")}`,
    },
    siteInfo.address && {
      icon: MapPin,
      title: "آدرس",
      value: siteInfo.address,
      href: "#",
    },
    siteInfo.workingHours && {
      icon: Clock,
      title: "ساعات کاری",
      value: siteInfo.workingHours,
      href: "#",
    },
  ].filter(Boolean) as Array<{
    icon: typeof Mail;
    title: string;
    value: string;
    href: string;
  }>;

  return (
    <><Seo
      title="تماس با ما"
      description="هر سؤال، پیشنهاد یا انتقادی داری؟ تیم پشتیبانی گریفین آماده‌ی کمکت هست. از راه‌های مختلف با ما در تماس باش."
      url="https://griffinedu.ir/contact" /><main className="min-h-screen px-6 py-16 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* ===== Hero ===== */}
          <section className="text-center space-y-6">
            <RevealOnScroll>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
                <MessageCircle size={14} className="text-[var(--griffin-gold)]" />
                <span className="text-xs font-bold text-[var(--griffin-gold)]">
                  تماس با ما
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={100}>
              <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                در{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  ارتباط
                </span>{" "}
                باشیم
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <p className="text-lg leading-9 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                هر سؤال، پیشنهاد یا انتقادی داری؟ تیم پشتیبانی گریفین آماده‌ی کمکت
                هست. از راه‌های زیر با ما در تماس باش.
              </p>
            </RevealOnScroll>
          </section>

          {/* ===== اطلاعات تماس ===== */}
          {contactInfo.length > 0 && (
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                return (
                  <RevealOnScroll key={i} delay={i * 100}>
                    <a
                      href={info.href}
                      className="group block rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40 overflow-hidden"
                    >
                      <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-2xl bg-[var(--griffin-gold)] blur-lg opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none" />
                        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[var(--griffin-gold)]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <Icon size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {info.title}
                      </p>
                      <p className="font-heading font-bold text-gray-900 dark:text-white text-sm break-words">
                        {info.value}
                      </p>
                    </a>
                  </RevealOnScroll>
                );
              })}
            </section>
          )}

          {/* ===== فرم + نقشه ===== */}
          <section className="grid lg:grid-cols-5 gap-8">
            {/* فرم تماس */}
            <RevealOnScroll direction="right" className="lg:col-span-3">
              <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                    پیامت رو بفرست
                  </h2>
                  <div className="w-16 h-1 bg-[var(--griffin-gold)] rounded-full mt-3" />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    فرم زیر را پر کن، در اسرع وقت پاسخ می‌دهیم.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                        نام و نام خانوادگی
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="نامت را وارد کن"
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20" />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                        ایمیل
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="ایمیلت را وارد کن"
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                      موضوع
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="موضوع پیام"
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                      پیام
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="پیامت را بنویس..."
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 resize-none" />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-8 py-3.5 font-bold text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          ارسال پیام
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  </button>

                  {sent && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 animate-[fadeIn_0.3s_ease-out]">
                      پیامت با موفقیت ارسال شد! به‌زودی باهات تماس می‌گیریم.
                    </div>
                  )}

                  {formError && (
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                      {formError}
                    </div>
                  )}
                </form>
              </div>
            </RevealOnScroll>

            {/* نقشه + FAQ */}
            <RevealOnScroll
              direction="left"
              delay={150}
              className="lg:col-span-2"
            >
              <div className="space-y-6 h-full">
                {/* نقشه */}
                {/* <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm aspect-video lg:aspect-[4/3]">
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=47.1157%2C36.402%2C47.1167%2C36.4028&layer=mapnik"
        className="w-full h-full grayscale dark:invert dark:hue-rotate-180"
        style={{ border: 0 }}
        loading="lazy"
        title="نقشه دفتر مرکزی"
      />
      <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin
            size={14}
            className="text-[var(--griffin-gold)] shrink-0"
          />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            آذربایجان غربی — تکاب
          </span>
        </div>
      </div>
    </div> */}

                {/* FAQ کوچک */}
                <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 space-y-4">
                  <h3 className="font-heading font-bold text-gray-900 dark:text-white">
                    سوالات پرتکرار
                  </h3>
                  {[
                    {
                      q: "چقدر طول می‌کشه پاسخ بگیرم؟",
                      a: "معمولاً کمتر از ۲۴ ساعت.",
                    },
                    {
                      q: "پشتیبانی تلفنی هم دارید؟",
                      a: "بله، شنبه تا پنجشنبه ۹ تا ۱۸.",
                    },
                    {
                      q: "می‌تونم بازدید حضوری داشته باشم؟",
                      a: "فعلا به دلیل نبود یک دفتر مرکزی، خیر.",
                    },
                  ].map((item, i) => (
                    <details
                      key={i}
                      className="group border-b border-gray-100 dark:border-white/5 pb-3 last:border-0"
                    >
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-[var(--griffin-gold)] transition-colors">
                        {item.q}
                        <span className="w-5 h-5 rounded-full bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] flex items-center justify-center text-xs transition-transform group-open:rotate-45 shrink-0">
                          +
                        </span>
                      </summary>
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-6">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </section>
        </div>
      </main></>
  );
};

export default Contact;