import {
  BookOpen,
  Brain,
  Coffee,
  GraduationCap,
  Moon,
  Sparkles,
  Users,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type ActivityType = "class" | "study" | "review" | "rest" | "sleep";

interface Activity {
  start: number;
  end: number;
  text: string;
  type: ActivityType;
}

interface DayPlan {
  day: string;
  dayEn: string;
  activities: Activity[];
}

// ============================================================
// HELPERS
// ============================================================

const t = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const fmtHour = (h: number): string => `${String(h).padStart(2, "0")}:۰۰`;

// ============================================================
// CONFIG
// ============================================================

const CARD_HEIGHT = 90;
const DAY_COL_WIDTH = 100;
const START_HOUR = 10;
const END_HOUR = 24;

const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_MINUTES = TOTAL_HOURS * 60;

const MIN_TO_PERCENT = 100 / TOTAL_MINUTES;

// ============================================================
// DATA
// ============================================================

const schedule: DayPlan[] = [
  {
    day: "شنبه",
    dayEn: "SAT",
    activities: [
      { start: t("15:00"), end: t("16:00"), text: "تکالیف", type: "study" },
      { start: t("16:15"), end: t("17:15"), text: "ریاضی", type: "study" },
      { start: t("17:15"), end: t("18:00"), text: "فیزیک", type: "review" },
      { start: t("18:30"), end: t("20:00"), text: "فیزیک", type: "class" },
      { start: t("20:15"), end: t("21:45"), text: "زبان", type: "class" },
      { start: t("21:45"), end: t("23:30"), text: "استراحت", type: "sleep" },
    ],
  },
  {
    day: "یکشنبه",
    dayEn: "SUN",
    activities: [
      { start: t("14:30"), end: t("15:30"), text: "تکالیف", type: "study" },
      { start: t("15:45"), end: t("16:30"), text: "زیست", type: "study" },
      { start: t("16:45"), end: t("18:15"), text: "عربی", type: "class" },
      { start: t("18:30"), end: t("19:15"), text: "شام", type: "rest" },
      { start: t("19:15"), end: t("20:15"), text: "شیمی", type: "study" },
      { start: t("20:30"), end: t("21:15"), text: "ریاضی", type: "review" },
      { start: t("21:15"), end: t("22:00"), text: "امتحان‌های نزدیک", type: "review" },
    ],
  },
  {
    day: "دوشنبه",
    dayEn: "MON",
    activities: [
      { start: t("14:30"), end: t("15:30"), text: "تکالیف", type: "study" },
      { start: t("15:30"), end: t("16:30"), text: "زیست", type: "review" },
      { start: t("16:45"), end: t("18:15"), text: "فارسی", type: "class" },
      { start: t("18:30"), end: t("20:00"), text: "فیزیک", type: "class" },
      { start: t("20:30"), end: t("21:15"), text: "فیزیک", type: "review" },
      { start: t("21:15"), end: t("22:00"), text: "امتحان و تکالیف", type: "review" },
    ],
  },
  {
    day: "سه‌شنبه",
    dayEn: "TUE",
    activities: [
      { start: t("14:00"), end: t("15:00"), text: "تکالیف", type: "study" },
      { start: t("15:00"), end: t("16:00"), text: "پیش‌خوانی شیمی", type: "study" },
      { start: t("16:00"), end: t("16:45"), text: "استراحت", type: "rest" },
      { start: t("17:00"), end: t("20:00"), text: "شیمی", type: "class" },
      { start: t("20:30"), end: t("21:15"), text: "نکات شیمی", type: "review" },
      { start: t("21:15"), end: t("22:00"), text: "امتحان‌های نزدیک", type: "review" },
    ],
  },
  {
    day: "چهارشنبه",
    dayEn: "WED",
    activities: [
      { start: t("13:30"), end: t("14:30"), text: "تکالیف", type: "study" },
      { start: t("14:30"), end: t("15:30"), text: "ریاضی", type: "review" },
      { start: t("16:00"), end: t("20:00"), text: "زیست", type: "class" },
      { start: t("20:00"), end: t("21:45"), text: "ریاضی", type: "class" },
      { start: t("22:00"), end: t("23:15"), text: "دین و زندگی", type: "class" },
      { start: t("23:15"), end: t("23:45"), text: "درس ممنوع!", type: "sleep" },
    ],
  },
  {
    day: "پنجشنبه",
    dayEn: "THU",
    activities: [
      { start: t("10:00"), end: t("11:00"), text: "درس‌های مدرسه", type: "review" },
      { start: t("11:15"), end: t("12:15"), text: "زیست", type: "study" },
      { start: t("14:30"), end: t("15:30"), text: "شیمی", type: "study" },
      { start: t("15:45"), end: t("16:45"), text: "ریاضی", type: "study" },
      { start: t("17:15"), end: t("18:15"), text: "تکالیف", type: "study" },
      { start: t("19:00"), end: t("19:45"), text: "امتحان‌های نزدیک", type: "review" },
      { start: t("20:00"), end: t("23:30"), text: "استراحت", type: "sleep" },
    ],
  },
  {
    day: "جمعه",
    dayEn: "FRI",
    activities: [
      { start: t("10:00"), end: t("11:00"), text: "هفتگی زیست", type: "review" },
      { start: t("11:15"), end: t("12:15"), text: "هفتگی شیمی", type: "review" },
      { start: t("14:30"), end: t("15:30"), text: "ریاضی", type: "study" },
      { start: t("15:45"), end: t("16:45"), text: "فیزیک", type: "study" },
      { start: t("17:15"), end: t("18:15"), text: "تکالیف", type: "study" },
      { start: t("18:30"), end: t("19:15"), text: "عربی / زبان", type: "study" },
      { start: t("19:15"), end: t("20:00"), text: "امتحان‌های هفته آینده", type: "review" },
      { start: t("20:00"), end: t("23:30"), text: "استراحت کامل", type: "sleep" },
    ],
  },
];

// ============================================================
// STYLES
// ============================================================

const typeStyles: Record<
  ActivityType,
  {
    icon: typeof BookOpen;
    label: string;
    card: string;
    text: string;
    iconBg: string;
  }
> = {
  class: {
    icon: Users,
    label: "کلاس",
    card: "bg-amber-100 dark:bg-amber-500/15 border-amber-400 dark:border-amber-500/50",
    text: "text-amber-900 dark:text-amber-100",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-700",
  },
  study: {
    icon: BookOpen,
    label: "درس",
    card: "bg-blue-100 dark:bg-blue-500/15 border-blue-400 dark:border-blue-500/50",
    text: "text-blue-900 dark:text-blue-100",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  review: {
    icon: Brain,
    label: "مرور",
    card: "bg-emerald-100 dark:bg-emerald-500/15 border-emerald-400 dark:border-emerald-500/50",
    text: "text-emerald-900 dark:text-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  },
  rest: {
    icon: Coffee,
    label: "استراحت",
    card: "bg-gray-100 dark:bg-gray-500/15 border-gray-400 dark:border-gray-500/50",
    text: "text-gray-800 dark:text-gray-100",
    iconBg: "bg-gradient-to-br from-gray-400 to-gray-600",
  },
  sleep: {
    icon: Moon,
    label: "خواب",
    card: "bg-purple-100 dark:bg-purple-500/15 border-purple-400 dark:border-purple-500/50",
    text: "text-purple-900 dark:text-purple-100",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-700",
  },
};

// ============================================================
// COMPONENT
// ============================================================

const StudySchedule = () => {
  return (
    <main className="min-h-screen bg-[#F8F9FB] dark:bg-[#080B12] py-6 px-2 sm:px-4">
      <div className="max-w-[1500px] mx-auto space-y-5">
        {/* ==================== HEADER ==================== */}
        <header className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <GraduationCap size={26} strokeWidth={2.3} />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-1">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Weekly Schedule
                  </span>
                </div>
                <h1 className="font-heading text-2xl font-black text-gray-900 dark:text-white">
                  برنامه‌ی هفتگی
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(
                Object.entries(typeStyles) as [
                  ActivityType,
                  (typeof typeStyles)[ActivityType],
                ][]
              ).map(([key, style]) => {
                const Icon = style.icon;
                return (
                  <div
                    key={key}
                    className={`
                      inline-flex items-center gap-1.5
                      px-3 py-1.5 rounded-lg
                      text-[11px] font-black
                      border
                      ${style.card}
                      ${style.text}
                    `}
                  >
                    <Icon size={12} />
                    {style.label}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* ==================== SCHEDULE ==================== */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="overflow-x-auto">
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: `${DAY_COL_WIDTH}px 1fr`,
                minWidth: "1000px",
              }}
            >
              {/* ==================== HEADER ROW ==================== */}
              <div className="sticky top-0 z-30 bg-[#F8F9FB]/95 dark:bg-[#0a0d14]/95 backdrop-blur-md border-b-2 border-l-2 border-[var(--griffin-gold)]/30 p-3 flex items-center">
                <div className="inline-flex items-center gap-1.5">
                  <Sparkles size={10} className="text-[var(--griffin-gold)]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    روز / ساعت
                  </span>
                </div>
              </div>

              <div
                className="relative border-b-2 border-r-2 border-[var(--griffin-gold)]/30 sticky top-0 z-30 bg-[#F8F9FB]/95 dark:bg-[#0a0d14]/95 backdrop-blur-md"
                style={{ height: "56px" }}
              >
                {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                  const hour = START_HOUR + i;
                  return (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 flex items-center justify-center border-l border-gray-200/70 dark:border-white/5"
                      style={{
                        right: `${(i / TOTAL_HOURS) * 100}%`,
                        width: `${(1 / TOTAL_HOURS) * 100}%`,
                      }}
                    >
                      <div className="text-center">
                        <p className="font-heading text-sm font-black text-gray-900 dark:text-white tabular-nums">
                          {fmtHour(hour)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                          تا {fmtHour(hour + 1)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ==================== ROWS ==================== */}
              {schedule.map((day, {/* dayIdx*/}) => (
                <div key={day.day} className="contents group/row">
                  {/* ===== ستون روز ===== */}
                  <div className="sticky right-0 z-20 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-md border-b border-l-2 border-[var(--griffin-gold)]/30 p-3 group-hover/row:bg-[var(--griffin-gold)]/5 transition-colors flex items-center">
                    <div className="flex items-center gap-2">
                      {/* <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-md opacity-40" />
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-sm shadow-md">
                          {(dayIdx + 1).toLocaleString("fa-IR")}
                        </div>
                      </div> */}
                      <div className="min-w-0">
                        <p className="font-heading text-base font-black text-gray-900 dark:text-white truncate">
                          {day.day}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          {day.dayEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ===== ستون ساعت‌ها + کارت‌ها ===== */}
                  <div
                    className="relative border-b border-r border-gray-200/70 dark:border-white/5 group-hover/row:bg-[var(--griffin-gold)]/[0.02] transition-colors"
                    style={{ height: `${CARD_HEIGHT + 12}px` }}
                  >
                    {/* 🆕 خطوط ساعتی + خط‌چین‌های ۱۵ دقیقه‌ای */}
                    {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                      const slotStartPercent = (i / TOTAL_HOURS) * 100;
                      const slotWidthPercent = (1 / TOTAL_HOURS) * 100;

                      return (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-l border-gray-200/70 dark:border-white/5 pointer-events-none"
                          style={{
                            right: `${slotStartPercent}%`,
                            width: `${slotWidthPercent}%`,
                          }}
                        >
                          {/* ۳ خط‌چین در ۱۵، ۳۰، ۴۵ دقیقه */}
                          {[25, 50, 75].map((percent) => (
                            <div
                              key={percent}
                              className="absolute top-0 bottom-0 border-l border-dashed border-gray-200/50 dark:border-white/10 pointer-events-none"
                              style={{ right: `${percent}%` }}
                            />
                          ))}
                        </div>
                      );
                    })}

                    {/* کارت‌ها */}
                    {day.activities.map((activity, idx) => {
                      const style = typeStyles[activity.type];
                      const Icon = style.icon;
                      const durationMin = activity.end - activity.start;
                      const widthPercent = durationMin * MIN_TO_PERCENT;
                      const rightPercent =
                        (activity.start - START_HOUR * 60) * MIN_TO_PERCENT;
                      const isShort = widthPercent < 6;

                      return (
                        <div
                          key={idx}
                          className={`
                            absolute top-1.5 rounded-lg border
                            ${style.card}
                            overflow-hidden
                            shadow-sm hover:shadow-md
                            transition-shadow
                            z-10
                          `}
                          style={{
                            right: `${rightPercent}%`,
                            width: `calc(${widthPercent}% - 4px)`,
                            height: `${CARD_HEIGHT}px`,
                            marginRight: "2px",
                          }}
                        >
                          <div
                            className={`
                              flex items-center gap-1.5 p-2 h-full
                              ${isShort ? "flex-col justify-center gap-1" : ""}
                            `}
                          >
                            <div
                              className={`
                                shrink-0 w-5 h-5 rounded-md
                                flex items-center justify-center
                                text-white shadow-sm
                                ${style.iconBg}
                              `}
                            >
                              <Icon size={11} strokeWidth={2.5} />
                            </div>
                            <div
                              className={`
                                min-w-0 flex-1
                                ${isShort ? "text-center" : ""}
                              `}
                            >
                              <p
                                className={`
                                  text-[11px] font-bold
                                  leading-tight
                                  ${style.text}
                                  ${isShort ? "line-clamp-2" : ""}
                                `}
                              >
                                {activity.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <footer className="text-center pt-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)]/10 to-transparent border border-[var(--griffin-gold)]/30">
            <Sparkles size={14} className="text-[var(--griffin-gold)]" />
            <span className="font-heading text-sm font-black text-[var(--griffin-gold)]">
              با تلاش و نظم، به قله می‌رسی 🦅
            </span>
            <Sparkles size={14} className="text-[var(--griffin-gold)]" />
          </div>
        </footer>
      </div>
    </main>
  );
};

export default StudySchedule;