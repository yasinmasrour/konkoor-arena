import { useRef, useState } from "react";
import MathFormulaBuilder from "./MathFormulaBuilder";
import MathText from "./MathText";

type Tool = { label: string; insert: string; cursor?: number; title: string };

type ToolGroup = {
  title: string;
  tools: Tool[];
};

const toolGroups: ToolGroup[] = [
  {
    title: "ساختار",
    tools: [
      { label: "½", insert: "\\frac{}{}", cursor: 6, title: "کسر" },
      { label: "√", insert: "\\sqrt{}", cursor: 6, title: "رادیکال" },
      { label: "x²", insert: "^{}", cursor: 2, title: "توان" },
      { label: "xₙ", insert: "_{}", cursor: 2, title: "زیرنویس" },
      { label: "( )", insert: "\\left(  \\right)", cursor: 8, title: "پرانتز" },
      { label: "|x|", insert: "\\left|  \\right|", cursor: 8, title: "قدر مطلق" },
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

const MathEditor = ({ value, onChange, placeholder, rows = 4, label }: MathEditorProps) => {
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
      const nextCursor = selected ? start + insertion.length : start + (tool.cursor ?? insertion.length);
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const visibleGroups = showAdvanced ? toolGroups : toolGroups.slice(0, 4);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}

      <div className="rounded-xl border border-slate-200/70 bg-gray-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2 dark:border-white/10">
          <span className="text-[11px] font-medium text-gray-500">ابزار فرمول</span>
          <button
            type="button"
            onClick={() => setShowBuilder(true)}
            className="rounded-lg border border-[var(--griffin-gold)]/40 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-[var(--griffin-gold)] transition hover:bg-amber-100 dark:bg-amber-900/10 dark:hover:bg-amber-900/20"
          >
            Σ ساخت فرمول
          </button>
        </div>
        <div className="space-y-2">
          {visibleGroups.map((group) => (
            <div key={group.title} className="flex flex-wrap items-center gap-1.5">
              <span className="ml-1 min-w-fit text-[11px] font-medium text-gray-400">{group.title}</span>
              {group.tools.map((tool) => (
                <button
                  key={`${group.title}-${tool.title}`}
                  type="button"
                  title={tool.title}
                  onClick={() => insertTool(tool)}
                  className="min-w-9 rounded-lg border border-slate-200/70 bg-white px-2 py-1.5 text-sm font-semibold transition hover:border-[var(--griffin-gold)] hover:text-[var(--griffin-gold)] dark:border-white/10 dark:bg-[#111722]"
                >
                  <span dir="ltr">{tool.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((current) => !current)}
          className="mt-2 text-xs font-medium text-[var(--griffin-gold)] hover:underline"
        >
          {showAdvanced ? "نمایش ابزارهای کمتر" : "نمایش ابزارهای پیشرفته"}
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        dir="auto"
        className="w-full resize-y rounded-xl border border-slate-200/70 px-4 py-3 leading-7 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
      />

      <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs leading-6 text-gray-500 dark:bg-white/[0.03]">
        برای فرمول داخل متن از <span dir="ltr" className="font-mono">$...$</span> و برای فرمول جدا از <span dir="ltr" className="font-mono">$$...$$</span> استفاده کنید. برای ساختارهای تو‌در‌تو، ابتدا بخش موردنظر را انتخاب و سپس ابزار مناسب را بزنید.
      </div>

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
            const nextValue = value.slice(0, start) + formula + value.slice(end);
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

      {value && (
        <div className="rounded-xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="mb-2 text-xs text-gray-500">پیش‌نمایش</p>
          <div className="overflow-x-auto rounded-lg bg-gray-50 px-3 py-4 dark:bg-white/[0.02]">
            <MathText content={value} />
          </div>
        </div>
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
