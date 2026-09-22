import {
  Award,
  BookOpen,
  Heart,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import RevealOnScroll from "../components/common/RevealOnScroll";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "هدفمندی",
      description:
        "هر ابزار و ویژگی ما با هدف کمک به پیشرفت واقعی دانش‌آموزان طراحی شده است.",
    },
    {
      icon: Shield,
      title: "اعتماد و امنیت",
      description:
        "محیطی امن و قابل اعتماد برای یادگیری، رقابت و پیشرفت فراهم کرده‌ایم.",
    },
    {
      icon: Heart,
      title: "علاقه به یادگیری",
      description:
        "باور داریم یادگیری زمانی مؤثر است که با علاقه و انگیزه همراه باشد.",
    },
    {
      icon: Zap,
      title: "نوآوری",
      description:
        "با استفاده از فناوری‌های روز، تجربه‌ای متفاوت از یادگیری می‌سازیم.",
    },
  ];

  const milestones = [
    { year: "۱۴۰۲", title: "تولد گریفین", desc: "با یک ایده ساده شروع کردیم" },
    { year: "۱۴۰۳", title: "راه‌اندازی Arena", desc: "رقابت زنده بین دانش‌آموزان" },
    { year: "۱۴۰۳", title: "۱۲٬۰۰۰ کاربر", desc: "جامعه‌ای رو به رشد" },
    { year: "۱۴۰۴", title: "امروز", desc: "در مسیر موفقیت با شما" },
  ];

  const team = [
    {
      name: "ادمین مسرور",
      role: "مؤسس و مدیرعامل",
      initial: "م",
    },
    {
      name: "علی رضایی",
      role: "سرپرست فنی",
      initial: "ع",
    },
    {
      name: "سارا احمدی",
      role: "مدیر محتوا",
      initial: "س",
    },
    {
      name: "رضا کریمی",
      role: "طراح تجربه کاربری",
      initial: "ر",
    },
  ];

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* ===== Hero ===== */}
        <section className="text-center space-y-6">
          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
              <Sparkles size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-bold text-[var(--griffin-gold)]">
                درباره آکادمی گریفین
              </span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
              ما{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                مسیر موفقیت
              </span>{" "}
              را می‌سازیم
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <p className="text-lg leading-9 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              آکادمی گریفین یک پلتفرم هوشمند یادگیری، آزمون و رقابت است که با هدف
              کمک به دانش‌آموزان کنکوری برای رسیدن به موفقیت طراحی شده است.
            </p>
          </RevealOnScroll>
        </section>

        {/* ===== داستان ما ===== */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <RevealOnScroll direction="right">
            <div className="space-y-5">
              <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                داستان ما
              </h2>
              <div className="w-20 h-1 bg-[var(--griffin-gold)] rounded-full" />
              <p className="leading-9 text-gray-600 dark:text-gray-300">
                گریفین از یک ایده ساده شروع شد: چرا یادگیری و رقابت نمی‌توانند
                لذت‌بخش و هوشمند باشند؟ ما با تیمی از متخصصان آموزش، فناوری و
                روان‌شناسی، پلتفرمی ساختیم که هم یادگیری را ساده‌تر کند و هم
                انگیزه را زنده نگه دارد.
              </p>
              <p className="leading-9 text-gray-600 dark:text-gray-300">
                امروز هزاران دانش‌آموز از گریفین استفاده می‌کنند تا با آزمون‌های
                هوشمند، رقابت در Arena و تحلیل دقیق عملکرد، به بهترین نسخه خودشان
                تبدیل شوند.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="left" delay={100}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20 blur-2xl rounded-3xl" />
              <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-8 space-y-6">
                {[
                  { icon: Users, value: "۱۲٬۰۰۰+", label: "دانش‌آموز فعال" },
                  { icon: BookOpen, value: "۴۵٬۰۰۰+", label: "سوال حل‌شده" },
                  { icon: Award, value: "۹۸٪", label: "رضایت کاربران" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[var(--griffin-gold)]/30">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-heading text-2xl font-black text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ===== ارزش‌های ما ===== */}
        <section>
          <RevealOnScroll>
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                ارزش‌های ما
              </h2>
              <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
              <p className="mt-5 text-gray-600 dark:text-gray-300">
                چیزهایی که به آن‌ها باور داریم
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <RevealOnScroll key={i} delay={i * 100}>
                  <div className="group relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40 overflow-hidden h-full">
                    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 text-white mb-5 shadow-lg shadow-[var(--griffin-gold)]/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon size={22} strokeWidth={2.2} />
                    </div>

                    <h3 className="relative font-heading text-lg font-bold text-gray-900 dark:text-white">
                      {value.title}
                    </h3>
                    <p className="relative mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* ===== مسیر ما ===== */}
        <section>
          <RevealOnScroll>
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                مسیر ما
              </h2>
              <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
            </div>
          </RevealOnScroll>

          <div className="relative">
            {/* خط اتصال */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

            <div className="grid md:grid-cols-4 gap-8">
              {milestones.map((m, i) => (
                <RevealOnScroll key={i} delay={i * 120}>
                  <div className="relative text-center">
                    <div className="relative w-24 h-24 mx-auto mb-5">
                      <div className="absolute inset-0 rounded-full bg-[var(--griffin-gold)]/20 blur-xl" />
                      <div className="relative w-full h-full rounded-full border-2 border-[var(--griffin-gold)]/40 bg-white dark:bg-[#0a0d14] flex flex-col items-center justify-center">
                        <span className="font-heading font-black text-[var(--griffin-gold)] text-lg">
                          {m.year}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-heading font-bold text-gray-900 dark:text-white">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {m.desc}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ===== تیم ما ===== */}
        <section>
          <RevealOnScroll>
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                تیم ما
              </h2>
              <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
              <p className="mt-5 text-gray-600 dark:text-gray-300">
                افرادی که گریفین را می‌سازند
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <RevealOnScroll key={i} delay={i * 100}>
                <div className="group text-center rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40">
                  <div className="relative w-20 h-20 mx-auto mb-5">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                      {member.initial}
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {member.role}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section>
          <RevealOnScroll>
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-xl p-10 md:p-14 text-center">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />

              <div className="relative space-y-5">
                <Rocket
                  size={40}
                  className="mx-auto text-[var(--griffin-gold)]"
                />
                <h2 className="font-heading text-2xl md:text-4xl font-black text-gray-900 dark:text-white">
                  آماده‌ای با ما شروع کنی؟
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                  همین امروز به جامعه گریفین بپیوند و مسیر موفقیتت را شروع کن.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-8 py-3.5 font-bold text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all"
                >
                  <Rocket size={18} />
                  شروع مسیر
                </a>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </div>
    </main>
  );
};

export default About;