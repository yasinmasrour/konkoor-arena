import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FunctionSquare,
  Sigma,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import MathFormulaBuilder from "./MathFormulaBuilder";
import MathText from "./MathText";

type Tool = { label: string; insert: string; cursor?: number; title: string };
type ToolGroup = { title: string; tools: Tool[] };

// 🔹 آرایه‌های toolGroups رو دست نمی‌زنم (بدون تغییر)
const toolGroups: ToolGroup[] = [
  {
    title: "ساختار",
    tools: [
      { label: "½", insert: "\\frac{}{}", cursor: 6, title: "کسر" },
      { label: "√", insert: "\\sqrt{}", cursor: 6, title: "رادیکال" },
      { label: "x²", insert: "^{}", cursor: 2, title: "توان" },
      { label: "xₙ", insert: "_{}", cursor: 2, title: "زیرنویس" },
      { label: "( )", insert: "\\left(  \\right)", cursor: 8, title: "پرانتز" },
      {
        label: "|x|",
        insert: "\\left|  \\right|",
        cursor: 8,
        title: "قدر مطلق",
      },
    ],
  },
  {
    title: "توابع",
    tools: [
      { label: "log", insert: "\\log_{}", cursor: 5, title: "لگاریتم با پایه" },
      { label: "ln", insert: "\\ln", title: "لگاریتم طبیعی" },
      { label: "sin", insert: "\\sin", title: "سینوس" },
      { label: "cos", insert: "\\cos", title: "کسینوس" },
      { label: "tan", insert: "\\tan", title: "تانژانت" },
      { label: "lim", insert: "\\lim_{x\\to}", cursor: 9, title: "حد" },
    ],
  },
  {
    title: "عملگرها",
    tools: [
      { label: "∫", insert: "\\int_{}^{}", cursor: 6, title: "انتگرال" },
      { label: "Σ", insert: "\\sum_{}^{}", cursor: 6, title: "سیگما" },
      { label: "∞", insert: "\\infty", title: "بی‌نهایت" },
      { label: "→", insert: "\\to", title: "فلش" },
    ],
  },
  {
    title: "نمادها",
    tools: [
      { label: "π", insert: "\\pi", title: "پی" },
      { label: "α", insert: "\\alpha", title: "آلفا" },
      { label: "β", insert: "\\beta", title: "بتا" },
      { label: "θ", insert: "\\theta", title: "تتا" },
      { label: "Δ", insert: "\\Delta", title: "دلتا" },
      { label: "±", insert: "\\pm", title: "مثبت یا منفی" },
      { label: "≤", insert: "\\le", title: "کوچک‌تر یا مساوی" },
      { label: "≥", insert: "\\ge", title: "بزرگ‌تر یا مساوی" },
      { label: "≠", insert: "\\ne", title: "نابرابر" },
    ],
  },
  {
    title: "پیشرفته",
    tools: [
      {
        label: "□",
        insert: "\\begin{pmatrix} & \\\\ & \\\\end{pmatrix}",
        cursor: 17,
        title: "ماتریس ۲×۲",
      },
      { label: "∂", insert: "\\partial", title: "مشتق جزئی" },
      { label: "∇", insert: "\\nabla", title: "نابلا" },
      { label: "∞", insert: "\\infty", title: "بی‌نهایت" },
    ],
  },
];

const MathEditor = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
}: MathEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const insertTool = (tool: Tool) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    let insertion = tool.insert;

    if (selected && insertion.includes("{}")) {
      insertion = insertion.replace("{}", `{${selected}}`);
    }

    const nextValue = value.slice(0, start) + insertion + value.slice(end);
    onChange(nextValue);

    requestAnimationFrame(() => {
      const nextCursor = selected
        ? start + insertion.length
        : start + (tool.cursor ?? insertion.length);
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const visibleGroups = showAdvanced ? toolGroups : toolGroups.slice(0, 4);

  return (
    <div className="space-y-3">
      {/* ==================== برچسب ==================== */}
      {label && (
        <label className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
          <FunctionSquare size={14} className="text-[var(--griffin-gold)]" />
          {label}
        </label>
      )}

      {/* ==================== کارت ابزار ==================== */}
      <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
        {/* خط طلایی بالا */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

        {/* هاله تزئینی */}
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

        <div className="relative p-3">
          {/* ==================== هدر ابزار ==================== */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-200/70 dark:border-white/5">
            <div className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center">
                <Sigma size={13} className="text-[var(--griffin-gold)]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  ابزار فرمول
                </p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">
                  روی هر ابزار کلیک کن
                </p>
              </div>
            </div>

            {/* دکمه ساخت فرمول */}
            <button
              type="button"
              onClick={() => setShowBuilder(true)}
              className="group/btn relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-3.5 py-2 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Wand2 size={13} />
                ساخت فرمول
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            </button>
          </div>

          {/* ==================== گروه‌های ابزار ==================== */}
          <div className="space-y-3">
            {visibleGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {group.title}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 dark:via-white/5 to-transparent" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.tools.map((tool) => (
                    <button
                      key={`${group.title}-${tool.title}`}
                      type="button"
                      title={tool.title}
                      onClick={() => insertTool(tool)}
                      className="
                        group/tool relative
                        min-w-9
                        rounded-lg
                        border border-gray-200 dark:border-white/10
                        bg-white dark:bg-white/[0.03]
                        px-2.5 py-1.5
                        text-sm font-bold text-gray-700 dark:text-gray-200
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:border-[var(--griffin-gold)]/50
                        hover:text-[var(--griffin-gold)]
                        hover:bg-[var(--griffin-gold)]/5
                        hover:shadow-md hover:shadow-[var(--griffin-gold)]/10
                        overflow-hidden
                      "
                    >
                      <span dir="ltr" className="relative z-10 font-english">
                        {tool.label}
                      </span>
                      {/* shine effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/20 to-transparent -translate-x-full group-hover/tool:translate-x-full transition-transform duration-700" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ==================== دکمه پیشرفته ==================== */}
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="
              group/advanced
              mt-3 w-full
              inline-flex items-center justify-center gap-2
              rounded-xl
              border border-dashed border-gray-300 dark:border-white/10
              bg-transparent
              py-2
              text-[11px] font-black text-gray-500 dark:text-gray-400
              transition-all duration-300
              hover:border-[var(--griffin-gold)]/40
              hover:text-[var(--griffin-gold)]
              hover:bg-[var(--griffin-gold)]/5
            "
          >
            {showAdvanced ? (
              <>
                <ChevronUp size={14} />
                نمایش ابزارهای کمتر
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                نمایش ابزارهای پیشرفته
                <Sparkles size={11} className="text-[var(--griffin-gold)]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================== Textarea ==================== */}
      <div className="relative">
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100/90 dark:bg-white/10 backdrop-blur-sm text-[9px] font-black text-gray-500 dark:text-gray-400">
          <Type size={10} />
          LaTeX
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          dir="auto"
          className="
            w-full resize-y
            rounded-2xl
            border border-gray-200 dark:border-white/10
            bg-white/70 dark:bg-white/[0.02]
            backdrop-blur-sm
            px-4 py-3
            pt-10
            font-english
            leading-7
            text-gray-900 dark:text-white
            outline-none
            transition-all duration-300
            focus:border-[var(--griffin-gold)]
            focus:ring-2 focus:ring-[var(--griffin-gold)]/20
            focus:bg-white dark:focus:bg-white/[0.04]
            placeholder:font-body placeholder:text-gray-400
          "
        />
      </div>

      {/* ==================== راهنما ==================== */}
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/5 px-4 py-3">
        <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/15 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={14} className="text-[var(--griffin-gold)]" />
        </div>
        <p className="text-[11px] leading-6 text-gray-600 dark:text-gray-300 font-medium">
          برای فرمول داخل متن از{" "}
          <span
            dir="ltr"
            className="font-english inline-block px-1.5 py-0.5 rounded bg-white dark:bg-white/10 font-black text-[var(--griffin-gold)]"
          >
            $...$
          </span>{" "}
          و برای فرمول جدا از{" "}
          <span
            dir="ltr"
            className="font-english inline-block px-1.5 py-0.5 rounded bg-white dark:bg-white/10 font-black text-[var(--griffin-gold)]"
          >
            $$...$$
          </span>{" "}
          استفاده کن. برای ساختارهای تو‌در‌تو، ابتدا بخش موردنظر رو انتخاب کن و
          سپس ابزار مناسب رو بزن.
        </p>
      </div>

      {/* ==================== پیش‌نمایش ==================== */}
      {value && (
        <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
          {/* هدر پیش‌نمایش */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-200/70 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02]">
            <div className="inline-flex items-center gap-2">
              <Eye size={12} className="text-[var(--griffin-gold)]" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                پیش‌نمایش زنده
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              زنده
            </span>
          </div>

          {/* محتوای پیش‌نمایش */}
          <div className="p-4 overflow-x-auto">
            <div className="rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 px-4 py-5 min-h-[60px]">
              <MathText content={value} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== MathFormulaBuilder Modal ==================== */}
      {showBuilder && (
        <MathFormulaBuilder
          onClose={() => setShowBuilder(false)}
          onInsert={(formula) => {
            const textarea = textareaRef.current;
            if (!textarea) {
              onChange(value + formula);
              setShowBuilder(false);
              return;
            }
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const nextValue =
              value.slice(0, start) + formula + value.slice(end);
            onChange(nextValue);
            setShowBuilder(false);
            requestAnimationFrame(() => {
              textarea.focus();
              const nextCursor = start + formula.length;
              textarea.setSelectionRange(nextCursor, nextCursor);
            });
          }}
        />
      )}
    </div>
  );
};

type MathEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
};

export default MathEditor;
