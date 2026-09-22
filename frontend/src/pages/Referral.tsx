import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  Gift,
  HelpCircle,
  LoaderCircle,
  PartyPopper,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  getMyReferralInfo,
  formatReferralAmount,
  type MyReferralInfo,
} from "../api/referralApi";
import RevealOnScroll from "../components/common/RevealOnScroll";

const MILESTONE_COUNT = 10;
const MILESTONE_REWARD = 30000000;
const REFERRER_REWARD = 3000000;
const REFEREE_DISCOUNT = 1000000;

const Referral = () => {
  const [info, setInfo] = useState<MyReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyReferralInfo();
        if (!cancelled) setInfo(data);
      } catch {
        if (!cancelled)
          setError(
            "دریافت اطلاعات دعوت با مشکل مواجه شد. لطفاً دوباره تلاش کنید.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (!info) return;
    const text = `با کد دعوت من (${info.referralCode}) توی کنکور آرنا ثبت‌نام کن و ${formatReferralAmount(REFEREE_DISCOUNT)} تومان تخفیف بگیر!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "دعوت به کنکور آرنا", text });
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-[60vh] grid place-items-center px-6 py-16">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت اطلاعات دعوت...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !info) {
    return (
      <main className="min-h-[60vh] grid place-items-center px-6 py-16">
        <div className="max-w-md text-center space-y-4 rounded-3xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 text-red-500">
            <AlertTriangle size={28} strokeWidth={2.3} />
          </div>
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            {error || "خطایی رخ داد"}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  const { referralCode, cycle, stats, referrals } = info;
  const progressInCycle = stats.currentCycleReferrals % MILESTONE_COUNT;
  const progressPercent = (progressInCycle / MILESTONE_COUNT) * 100;
  const remaining = MILESTONE_COUNT - progressInCycle;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <header className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
              <Gift size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                GRIFFIN REFERRAL
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
              دعوت{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                دوستان
              </span>
            </h1>

            <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8">
              با هر دعوت موفق{" "}
              <strong className="text-[var(--griffin-gold)]">
                {formatReferralAmount(REFERRER_REWARD)} تومان
              </strong>{" "}
              جایزه بگیر و دوستت{" "}
              <strong className="text-[var(--griffin-gold)]">
                {formatReferralAmount(REFEREE_DISCOUNT)} تومان
              </strong>{" "}
              تخفیف بگیره.
            </p>
          </header>
        </RevealOnScroll>

        {/* ==================== کارت کد دعوت ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-[2rem] overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-amber-500/5 to-transparent backdrop-blur-xl p-6 sm:p-8">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="relative shrink-0 self-center lg:self-auto">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                  <Gift size={36} strokeWidth={2.2} />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Your Code
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  کد اختصاصی شما
                </p>
                <div className="inline-flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-sm px-5 py-3">
                  <span className="font-heading text-3xl sm:text-4xl font-black tracking-[0.3em] text-gray-900 dark:text-white font-english">
                    {referralCode}
                  </span>
                </div>
              </div>

              <div className="shrink-0 self-center lg:self-auto flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 font-heading font-black text-white text-sm shadow-2xl shadow-[var(--griffin-gold)]/50 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/80 hover:-translate-y-1 transition-all overflow-hidden whitespace-nowrap"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {copied ? (
                      <>
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                        کپی شد!
                      </>
                    ) : (
                      <>
                        <Copy size={16} strokeWidth={2.5} />
                        کپی کد
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm px-6 py-3.5 font-black text-gray-700 dark:text-gray-200 text-sm hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all whitespace-nowrap"
                >
                  <Share2 size={16} />
                  اشتراک‌گذاری
                </button>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== کارت‌های آماری ==================== */}
        <RevealOnScroll>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: Target,
                label: "دعوت این دوره",
                value: stats.currentCycleReferrals.toLocaleString("fa-IR"),
                color: "text-[var(--griffin-gold)]",
                bg: "bg-[var(--griffin-gold)]/10",
              },
              {
                icon: Users,
                label: "کل دعوت‌ها",
                value: stats.totalReferrals.toLocaleString("fa-IR"),
                color: "text-purple-600 dark:text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                icon: TrendingUp,
                label: "جوایز گرفته",
                value: `${formatReferralAmount(stats.totalRewards)} ت`,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Trophy,
                label: "جوایز ویژه",
                value: stats.milestonesEarned.toLocaleString("fa-IR"),
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
                  className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/10 animate-[fadeInUp_0.4s_ease-out_both]"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={18} className={stat.color} strokeWidth={2.3} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p
                    className={`font-heading text-xl sm:text-2xl font-black mt-1 tabular-nums ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </section>
        </RevealOnScroll>

        {/* ==================== پیشرفت Milestone ==================== */}
        <RevealOnScroll>
          <section className="rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 blur-xl opacity-50 animate-pulse" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white shadow-lg">
                    <Award size={22} strokeWidth={2.3} />
                  </div>
                </div>
                <div>
                  <h2 className="font-heading text-base font-black text-gray-900 dark:text-white">
                    پیشرفت جایزه {formatReferralAmount(MILESTONE_REWARD)} تومانی
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    هر {MILESTONE_COUNT} دعوت موفق = یک جایزه ویژه
                  </p>
                </div>
              </div>
              <div className="sm:mr-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-sm">
                <span className="font-heading text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {progressInCycle.toLocaleString("fa-IR")}
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  / {MILESTONE_COUNT.toLocaleString("fa-IR")}
                </span>
              </div>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-amber-400 to-amber-600 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              {remaining > 0 ? (
                <>
                  <strong className="text-amber-600 dark:text-amber-400 font-heading">
                    {remaining.toLocaleString("fa-IR")}
                  </strong>{" "}
                  دعوت دیگه تا جایزه {formatReferralAmount(MILESTONE_REWARD)}{" "}
                  تومانی!
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <PartyPopper
                    size={14}
                    className="text-amber-600 dark:text-amber-400"
                  />
                  شما به جایزه رسیدید!
                </span>
              )}
            </p>
          </section>
        </RevealOnScroll>

        {/* ==================== اطلاعات دوره ==================== */}
        <RevealOnScroll>
          <section className="rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shrink-0">
                <Calendar size={22} strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Current Cycle
                  </span>
                </div>
                <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  دوره فعلی: {cycle.jalaliStart} تا {cycle.jalaliEnd}
                </p>
              </div>
              <div className="text-left shrink-0">
                <p className="font-heading text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {cycle.daysRemaining.toLocaleString("fa-IR")}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  روز باقی‌مانده
                </p>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== لیست دعوت‌ها ==================== */}
        <RevealOnScroll>
          <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-200/70 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[var(--griffin-gold)]" />
                <h2 className="font-heading text-base font-black text-gray-900 dark:text-white">
                  دعوت‌های موفق
                </h2>
                <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-2 rounded-md bg-[var(--griffin-gold)]/10 text-[10px] font-black text-[var(--griffin-gold)] tabular-nums">
                  {referrals.length.toLocaleString("fa-IR")}
                </span>
              </div>
            </div>

            {referrals.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Users
                    size={28}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                  هنوز کسی رو دعوت نکردی
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  کدت رو با دوستات به اشتراک بذار و شروع کن!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200/70 dark:divide-white/5">
                {referrals.map((r, index) => (
                  <li
                    key={r.id}
                    style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
                    className="group relative flex items-center gap-3 p-4 hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] transition-all animate-[fadeInRight_0.3s_ease-out_both]"
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg">
                        <span className="font-heading text-base font-black">
                          {r.referee.name.charAt(0)}
                        </span>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                        <CheckCircle2
                          size={9}
                          className="text-white"
                          strokeWidth={3}
                        />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                        {r.referee.name}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-english">
                        @{r.referee.username}
                      </p>
                    </div>

                    <div className="shrink-0 text-left">
                      <p className="font-heading text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatReferralAmount(r.reward)}
                      </p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-500">
                        تومان
                      </p>
                      {r.isMilestone && (
                        <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[8px] font-black">
                          <Trophy size={8} />
                          ویژه
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </RevealOnScroll>

        {/* ==================== راهنما ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-[2rem] overflow-hidden border border-[var(--griffin-gold)]/20 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-xl p-8 md:p-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                  <HelpCircle size={22} strokeWidth={2.3} />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                    چطور دعوت کنم؟
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    فقط ۶ قدم ساده
                  </p>
                </div>
              </div>

              <ol className="grid gap-3 sm:grid-cols-2">
                {[
                  "کد اختصاصیتون رو کپی کنید",
                  "برای دوستاتون بفرستید",
                  "اونا موقع خرید اشتراک، کد رو وارد میکنن",
                  `دوستتون ${formatReferralAmount(REFEREE_DISCOUNT)} تومان تخفیف میگیره`,
                  `شما ${formatReferralAmount(REFERRER_REWARD)} تومان جایزه میگیرید`,
                  `هر ${MILESTONE_COUNT} دعوت موفق، ${formatReferralAmount(MILESTONE_REWARD)} تومان جایزه ویژه!`,
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/10 backdrop-blur-sm p-3.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] flex items-center justify-center shrink-0 font-heading text-xs font-black tabular-nums">
                      {(i + 1).toLocaleString("fa-IR")}
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300 leading-6">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== اطلاعات اضافی ==================== */}
        <RevealOnScroll>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-black text-gray-500 dark:text-gray-400">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5">
              <Clock3 size={11} />
              دوره‌ها از تیر تا تیر هر سال
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5">
              <Trophy size={11} />
              {stats.milestonesEarned.toLocaleString("fa-IR")} جایزه ویژه تا
              الان
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5">
              <Calendar size={11} />
              شروع دوره بعدی: {cycle.jalaliEnd}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </main>
  );
};

export default Referral;
