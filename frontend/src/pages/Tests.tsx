import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  FileQuestion,
  Flame,
  Layers,
  LoaderCircle,
  Lock,
  Medal,
  Quote,
  Rocket,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getExams } from "../services/examService";
import type { Exam } from "../types/exam";
import RevealOnScroll from "../components/common/RevealOnScroll";
import GriffinMascot from "../components/common/GriffinMascot";
import { useAuth } from "../context/AuthContext";

// ==================== کامپوننت ====================
const Tests = () => {
  const navigate = useNavigate();
  const { user, hasExamAccess } = useAuth();
  const isLoggedIn = Boolean(user);

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExams()
      .then((data) => setExams(data.exams))
      .catch((err) => console.error("Failed to load exams:", err))
      .finally(() => setLoading(false));
  }, []);

  // ==================== آمار کلی ====================
  const globalStats = useMemo(() => {
    const totalExams = exams.length;
    const totalQuestions = exams.reduce(
      (sum, e) =>
        sum +
        (e.booklets?.reduce(
          (s, b) => s + (b.booklet?.questions?.length ?? 0),
          0,
        ) ?? 0),
      0,
    );
    const totalBooklets = exams.reduce(
      (sum, e) => sum + (e.booklets?.length ?? 0),
      0,
    );

    return {
      totalExams,
      totalQuestions,
      totalBooklets,
    };
  }, [exams]);

  // ==================== آخرین آزمون‌ها (فقط ۴ تا) ====================
  const recentExams = useMemo(() => {
    return [...exams]
      .filter((e) => e.status === "published")
      .sort(
        (a, b) =>
          new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
      )
      .slice(0, 4);
  }, [exams]);

  // ==================== ویژگی‌ها ====================
  const features = [
    {
      icon: FileQuestion,
      title: "سوالات استاندارد کنکور",
      description:
        "همه سوالات توسط طراحان متخصص بررسی و تایید می‌شن تا با سطح کنکور هماهنگ باشن.",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      icon: Brain,
      title: "تحلیل هوشمند با AI",
      description:
        "بعد از هر آزمون، هوش مصنوعی نقاط قوت و ضعفت رو تحلیل می‌کنه و راهکار می‌ده.",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: Clock,
      title: "زمان‌بندی دفترچه‌ای",
      description:
        "مثل کنکور واقعی، هر دفترچه زمان مستقل داره و ترتیب سوالات رعایت می‌شه.",
      color: "from-[var(--griffin-gold)] to-amber-700",
    },
    {
      icon: TrendingUp,
      title: "نمودار پیشرفت",
      description:
        "روند نمراتت رو در طول زمان ببین و بفهم کجا داری بهتر می‌شی.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: Swords,
      title: "رقابت زنده در آرنا",
      description: "با یه نبرد سریع با حریف هم‌سطح، معلوماتت رو محک بزن.",
      color: "from-rose-500 to-rose-700",
    },
    {
      icon: Target,
      title: "مقایسه با میانگین",
      description:
        "بعد از آزمون، نمره‌ت رو با میانگین همه شرکت‌کنندگان مقایسه کن.",
      color: "from-cyan-500 to-cyan-700",
    },
  ];

  // ==================== مراحل ====================
  const steps = [
    {
      number: 1,
      icon: Crown,
      title: "اشتراکت رو فعال کن",
      description:
        "با یه پلن مناسب، به همه آزمون‌ها و امکانات ویژه دسترسی پیدا کن.",
    },
    {
      number: 2,
      icon: BookOpen,
      title: "توی آزمون شرکت کن",
      description:
        "آزمون‌ها رو از داشبوردت انتخاب کن و با تمرکز به سوالات جواب بده.",
    },
    {
      number: 3,
      icon: BarChart3,
      title: "تحلیل و پیشرفت",
      description:
        "نتیجه‌ت رو ببین، تحلیل AI رو بخون و برای آزمون بعدی آماده‌تر شو.",
    },
  ];

  // ==================== نقل قول‌ها ====================
  const testimonials = [
    {
      name: "امیر محمدی",
      role: "دوازدهم ریاضی",
      text: "با آزمون‌های گریفین، تونستم رتبه‌م رو تو آزمون‌های آزمایشی ۳۰۰۰ تا بهتر کنم. تحلیل AI واقعاً معرکه‌ست!",
      avatar: "ا",
    },
    {
      name: "سارا احمدی",
      role: "دوازدهم تجربی",
      text: "مقایسه نمره‌م با میانگین کمک کرد بفهمم واقعاً کجا ضعیفم. اینجا جزوه‌ها و آزمون‌ها خیلی حرفه‌ای‌ان.",
      avatar: "س",
    },
    {
      name: "علی رضایی",
      role: "یازدهم انسانی",
      text: "بخش آرنا باعث شد برای یادگیری انگیزه بیشتری داشته باشم. با دوستام مسابقه می‌دیم و کیف می‌کنیم!",
      avatar: "ع",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FB] dark:bg-[#080B12] overflow-hidden">
      {/* ==================== HERO ==================== */}
      <RevealOnScroll>
        <section className="relative overflow-hidden bg-[#080B12] text-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/20 via-transparent to-purple-600/15 pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/25 blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" />

          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)] pointer-events-none"
              style={{
                // eslint-disable-next-line react-hooks/purity
                top: `${Math.random() * 100}%`,
                // eslint-disable-next-line react-hooks/purity
                left: `${Math.random() * 100}%`,
                // eslint-disable-next-line react-hooks/purity
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                // eslint-disable-next-line react-hooks/purity
                animationDelay: `${Math.random() * 3}s`,
                // eslint-disable-next-line react-hooks/purity
                opacity: 0.3 + Math.random() * 0.5,
              }}
            />
          ))}

          <div className="relative max-w-6xl mx-auto">
            {/* ==================== grid دو ستونه: متن + mascot ==================== */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* ===== متن ===== */}
              <div className="text-center lg:text-right space-y-6 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 backdrop-blur-sm">
                  <Sparkles
                    size={14}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-xs font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                    Griffins Test Center
                  </span>
                </div>

                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  با آزمون‌های{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                    گریفین
                  </span>
                  <br />
                  به کنکور مسلط شو
                </h1>

                <p className="text-gray-300 leading-8 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg">
                  آزمون‌های استاندارد با تحلیل هوشمند AI، مقایسه با میانگین،
                  نمودار پیشرفت و رقابت زنده. همه‌چیز برای موفقیت تو، در یک
                  پلتفرم.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                  <button
                    onClick={() =>
                      isLoggedIn
                        ? navigate("/subscriptions")
                        : navigate("/register")
                    }
                    className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-8 py-4 font-heading font-black text-white shadow-2xl shadow-[var(--griffin-gold)]/50 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/80 hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket size={20} />
                      {isLoggedIn ? "خرید اشتراک" : "شروع کن رایگان"}
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>

                  <button
                    onClick={() => {
                      document
                        .getElementById("features")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 font-bold text-white hover:bg-white/10 hover:border-white/30 transition-all"
                  >
                    <Sparkles size={18} />
                    بیشتر بدون
                  </button>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-6 text-sm">
                  {[
                    { value: globalStats.totalExams, label: "آزمون فعال" },
                    {
                      value: globalStats.totalQuestions,
                      label: "سوال استاندارد",
                    },
                    { value: globalStats.totalBooklets, label: "دفترچه" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-baseline gap-2">
                      <span className="font-heading text-2xl font-black text-[var(--griffin-gold)] tabular-nums">
                        {stat.value.toLocaleString("fa-IR")}+
                      </span>
                      <span className="text-gray-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== mascot ===== */}
              <div className="relative order-1 lg:order-2 flex items-center justify-center">
                <div className="relative w-full max-w-[380px] md:max-w-[460px]">
                  <GriffinMascot
                    variant="tests"
                    size="2xl"
                    animation="float"
                    glowColor="gold"
                    halo
                    particles
                    className="w-full h-auto"
                  />
                </div>

                {/* برچسب شناور */}
                <div className="absolute top-2 right-2 lg:top-6 lg:right-4 animate-[float_3s_ease-in-out_infinite]">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-xl border border-[var(--griffin-gold)]/30 shadow-2xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                      <FileQuestion size={15} />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Tests
                      </p>
                      <p className="text-[11px] font-black text-gray-900 dark:text-white">
                        آماده آزمون
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ==================== چرا گریفین؟ ==================== */}
      <RevealOnScroll>
        <section id="features" className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-3">
                <Medal size={14} className="text-[var(--griffin-gold)]" />
                <span className="text-xs font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                  Why Griffins
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
                چرا آزمون‌های گریفین؟
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-7">
                ما فقط یه آزمون آنلاین نیستیم. یه سیستم کامل برای موفقیت تو در
                کنکوریم.
              </p>
              <div className="w-16 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="
                      group relative rounded-2xl overflow-hidden
                      border border-gray-200 dark:border-white/10
                      bg-white/70 dark:bg-white/[0.04]
                      backdrop-blur-sm p-6
                      transition-all duration-300
                      hover:-translate-y-2
                      hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10
                      hover:border-[var(--griffin-gold)]/40
                    "
                  >
                    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative">
                      <div
                        className={`
                          relative w-14 h-14 rounded-2xl
                          bg-gradient-to-br ${feature.color}
                          flex items-center justify-center text-white
                          shadow-lg mb-4
                          transition-transform duration-300
                          group-hover:scale-110 group-hover:rotate-3
                        `}
                      >
                        <Icon size={24} strokeWidth={2.3} />
                      </div>

                      <h3 className="font-heading text-base font-black text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>

                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-6">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ==================== نمونه آزمون‌ها ==================== */}
      {!loading && recentExams.length > 0 && (
        <RevealOnScroll>
          <section className="px-4 py-16 sm:px-6 sm:py-20 bg-gray-50/50 dark:bg-white/[0.01]">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-3">
                  <FileQuestion
                    size={14}
                    className="text-[var(--griffin-gold)]"
                  />
                  <span className="text-xs font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                    Latest Exams
                  </span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
                  جدیدترین آزمون‌ها
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-7">
                  چند تا از آزمون‌های اخیر رو ببین. برای شرکت، کافیه اشتراک
                  داشته باشی.
                </p>
                <div className="w-16 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentExams.map((exam, i) => {
                  const totalQuestions =
                    exam.booklets?.reduce(
                      (sum, b) => sum + (b.booklet?.questions?.length ?? 0),
                      0,
                    ) ?? 0;
                  const totalDuration =
                    exam.booklets?.reduce(
                      (sum, b) => sum + (b.booklet?.duration ?? 0),
                      0,
                    ) ?? 0;

                  const hasAccess = isLoggedIn && hasExamAccess(exam.id);

                  return (
                    <div
                      key={i}
                      className="
                        group relative rounded-2xl overflow-hidden
                        border border-gray-200 dark:border-white/10
                        bg-white/70 dark:bg-white/[0.04]
                        backdrop-blur-sm p-5
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-lg
                        hover:border-[var(--griffin-gold)]/40
                      "
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                          <BookOpen size={18} />
                        </div>
                        {hasAccess ? (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500"
                          />
                        ) : (
                          <Lock size={14} className="text-gray-400" />
                        )}
                      </div>

                      <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-5 mb-3">
                        {exam.title}
                      </h3>

                      <div className="space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <FileQuestion size={11} />
                          <span className="tabular-nums">
                            {totalQuestions.toLocaleString("fa-IR")} سوال
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} />
                          <span className="tabular-nums">
                            {totalDuration.toLocaleString("fa-IR")} دقیقه
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} />
                          <span>
                            {new Date(exam.examDate).toLocaleDateString(
                              "fa-IR",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                        <button
                          onClick={() =>
                            navigate(
                              hasAccess
                                ? `/tests/${exam.id}`
                                : isLoggedIn
                                  ? "/subscriptions"
                                  : "/register",
                            )
                          }
                          className={`
                            w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black transition-all
                            ${
                              hasAccess
                                ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-md shadow-[var(--griffin-gold)]/30 hover:shadow-lg"
                                : "bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/20"
                            }
                          `}
                        >
                          {hasAccess ? (
                            <>
                              <Rocket size={11} />
                              شرکت در آزمون
                            </>
                          ) : (
                            <>
                              <Crown size={11} />
                              برای شرکت، اشتراک بگیر
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() =>
                    navigate(
                      isLoggedIn ? "/dashboard?section=exams" : "/register",
                    )
                  }
                  className="group inline-flex items-center gap-2 text-sm font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
                >
                  {isLoggedIn
                    ? "مشاهده همه آزمون‌ها در داشبورد"
                    : "ثبت‌نام و مشاهده همه آزمون‌ها"}
                  <ArrowLeft
                    size={14}
                    className="rotate-180 transition-transform group-hover:-translate-x-1"
                  />
                </button>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ==================== نحوه کار ==================== */}
      <RevealOnScroll>
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-3">
                <Zap size={14} className="text-[var(--griffin-gold)]" />
                <span className="text-xs font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                  How It Works
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
                فقط در ۳ قدم
              </h2>
              <div className="w-16 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid sm:grid-cols-3 gap-6 relative">
              <div className="hidden sm:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[var(--griffin-gold)]/30 via-[var(--griffin-gold)]/50 to-[var(--griffin-gold)]/30" />

              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative text-center">
                    <div className="relative inline-flex mb-4">
                      <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-40" />
                      <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-4 border-[#F8F9FB] dark:border-[#080B12]">
                        <Icon size={32} strokeWidth={2.3} />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-sm font-black border-2 border-[#F8F9FB] dark:border-[#080B12] shadow-lg">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-black text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-6 max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ==================== نقل قول‌ها ==================== */}
      <RevealOnScroll>
        <section className="px-4 py-16 sm:px-6 sm:py-20 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-3">
                <Star
                  size={14}
                  className="text-[var(--griffin-gold)]"
                  fill="currentColor"
                />
                <span className="text-xs font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                  Testimonials
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
                دانش‌آموزان چی می‌گن؟
              </h2>
              <div className="w-16 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="
                    relative rounded-2xl overflow-hidden
                    border border-gray-200 dark:border-white/10
                    bg-white/70 dark:bg-white/[0.04]
                    backdrop-blur-sm p-6
                    transition-all duration-300
                    hover:-translate-y-1
                  "
                >
                  <Quote
                    size={40}
                    className="absolute top-4 left-4 text-[var(--griffin-gold)]/10"
                  />

                  <div className="relative">
                    <div className="flex gap-0.5 mb-4">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className="text-[var(--griffin-gold)]"
                          fill="currentColor"
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-7 mb-5">
                      «{t.text}»
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-heading text-xs font-black text-gray-900 dark:text-white">
                          {t.name}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* ==================== CTA نهایی ==================== */}
      <RevealOnScroll>
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-[#080B12] text-white p-8 sm:p-12 text-center border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/20 via-transparent to-purple-600/20 pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px]" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px]" />

              <div className="relative space-y-6">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-60 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-2xl rotate-3">
                    <Crown size={36} strokeWidth={2.3} />
                  </div>
                </div>

                <h2 className="font-heading text-3xl sm:text-4xl font-black leading-tight">
                  آماده‌ای قهرمان کنکور بشی؟
                </h2>

                <p className="text-gray-300 max-w-lg mx-auto text-sm sm:text-base leading-7">
                  با فعال‌سازی اشتراک، به همه آزمون‌ها، تحلیل هوشمند AI، مقایسه
                  با میانگین و رقابت زنده دسترسی پیدا می‌کنی.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() =>
                      isLoggedIn
                        ? navigate("/subscriptions")
                        : navigate("/register")
                    }
                    className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-8 py-4 font-heading font-black text-white shadow-2xl shadow-[var(--griffin-gold)]/50 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/80 hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket size={20} />
                      {isLoggedIn ? "مشاهده پلن‌ها" : "شروع کن رایگان"}
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>

                  {!isLoggedIn && (
                    <button
                      onClick={() => navigate("/login")}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 font-bold text-white hover:bg-white/10 transition-all"
                    >
                      ورود به حساب
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg mx-auto">
                  {[
                    { icon: CheckCircle2, label: "دسترسی کامل" },
                    { icon: CheckCircle2, label: "تحلیل AI" },
                    { icon: CheckCircle2, label: "پشتیبانی" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-300"
                      >
                        <Icon size={12} className="text-emerald-400 shrink-0" />
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>
    </main>
  );
};

export default Tests;
