import { ArrowDownUp, Search, X } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const categories = ["همه", "ریاضی", "فیزیک", "شیمی", "زیست", "ادبیات", "عربی"];

export type SortOption = "newest" | "oldest" | "mostQuestions" | "leastQuestions";

interface TestFiltersProps {
  active: string;
  onChange: (category: string) => void;
  counts?: Record<string, number>;
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  newest: "جدیدترین",
  oldest: "قدیمی‌ترین",
  mostQuestions: "بیشترین سوال",
  leastQuestions: "کمترین سوال",
};

const TestFilters = ({
  active,
  onChange,
  counts,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: TestFiltersProps) => {
  return (
    <section className="space-y-4">
      {/* ==================== ردیف ۱: جستجو + مرتب‌سازی ==================== */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* جستجو */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجو در عنوان آزمون..."
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm py-2.5 pr-10 pl-10 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* مرتب‌سازی */}
        <div className="relative shrink-0">
          <ArrowDownUp
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)] pointer-events-none"
          />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none w-full sm:w-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm py-2.5 pr-10 pl-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all cursor-pointer"
          >
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key} className="bg-white dark:bg-[#0a0d14]">
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ==================== ردیف ۲: دسته‌بندی ==================== */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = active === category;
          const count = counts?.[category];

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`
                group inline-flex items-center gap-2
                rounded-full px-4 py-2
                text-xs font-black
                transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-md shadow-[var(--griffin-gold)]/40"
                    : "bg-white/70 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                }
              `}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
              <span>{category}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center
                    min-w-[18px] h-[16px] px-1 rounded-md
                    text-[9px] font-black tabular-nums
                    ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                    }
                  `}
                >
                  {count.toLocaleString("fa-IR")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default TestFilters;