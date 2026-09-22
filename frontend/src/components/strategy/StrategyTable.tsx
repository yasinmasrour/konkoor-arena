import { Calendar } from "lucide-react";
import type { StrategyData } from "../../api/strategyApi";

interface StrategyTableProps {
  data: StrategyData;
}

const StrategyTable = ({ data }: StrategyTableProps) => {
  const { lessons, exams } = data;

  if (lessons.length === 0 || exams.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-8 text-center">
        <Calendar
          size={24}
          className="mx-auto text-gray-400 dark:text-gray-600 mb-3"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">جدول خالیه</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      {/* خط طلایی بالا */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-right text-sm">
          {/* ==================== هدر ==================== */}
          <thead>
            <tr className="bg-gradient-to-l from-[var(--griffin-gold)]/10 to-transparent">
              <th className="px-4 py-4 text-right sticky right-0 z-10 bg-white/90 dark:bg-[#0a0d14]/90 backdrop-blur-sm border-l border-gray-200/70 dark:border-white/5 min-w-[100px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  آزمون
                </span>
              </th>
              {lessons.map((lesson, i) => (
                <th
                  key={i}
                  className="px-4 py-4 text-center border-l border-gray-200/70 dark:border-white/5 min-w-[120px]"
                >
                  <span className="font-heading text-xs font-black text-gray-900 dark:text-white">
                    {lesson}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* ==================== بدنه ==================== */}
          <tbody>
            {exams.map((exam, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  border-t border-gray-200/70 dark:border-white/5
                  hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.03]
                  transition-colors
                  ${rowIndex % 2 === 0 ? "bg-white/30 dark:bg-white/[0.01]" : ""}
                `}
              >
                {/* عنوان آزمون */}
                <td className="px-4 py-4 sticky right-0 z-10 bg-white/90 dark:bg-[#0a0d14]/90 backdrop-blur-sm border-l border-gray-200/70 dark:border-white/5">
                  <span className="font-heading text-xs font-black text-gray-900 dark:text-white">
                    {exam.title}
                  </span>
                </td>

                {/* خونهها */}
                {exam.cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-4 text-center border-l border-gray-200/70 dark:border-white/5"
                  >
                    <span className="text-xs text-gray-700 dark:text-gray-300 leading-6 whitespace-pre-wrap">
                      {cell || "—"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategyTable;
