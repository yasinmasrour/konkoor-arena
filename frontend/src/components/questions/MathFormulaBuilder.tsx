import { useMemo, useState } from "react";
import {
  Calculator,
  Check,
  Eye,
  FunctionSquare,
  Grid3X3,
  Sigma,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import MathText from "./MathText";

type BuilderProps = {
  onClose: () => void;
  onInsert: (formula: string) => void;
};
type BuilderType =
  | "fraction"
  | "sqrt"
  | "power"
  | "subscript"
  | "log"
  | "integral"
  | "sum"
  | "matrix";

const templates: Array<{
  id: BuilderType;
  label: string;
  preview: string;
  icon: typeof Calculator;
  color: string;
}> = [
  {
    id: "fraction",
    label: "کسر",
    preview: "\\frac{a}{b}",
    icon: Grid3X3,
    color: "emerald",
  },
  {
    id: "sqrt",
    label: "رادیکال",
    preview: "\\sqrt{x}",
    icon: FunctionSquare,
    color: "emerald",
  },
  { id: "power", label: "توان", preview: "x^{n}", icon: Zap, color: "amber" },
  {
    id: "subscript",
    label: "اندیس",
    preview: "x_{n}",
    icon: Zap,
    color: "amber",
  },
  {
    id: "log",
    label: "لگاریتم",
    preview: "\\log_{b}(x)",
    icon: FunctionSquare,
    color: "purple",
  },
  {
    id: "integral",
    label: "انتگرال",
    preview: "\\int_{a}^{b} f(x)\\,dx",
    icon: Sigma,
    color: "purple",
  },
  {
    id: "sum",
    label: "سیگما",
    preview: "\\sum_{i=1}^{n} a_i",
    icon: Sigma,
    color: "rose",
  },
  {
    id: "matrix",
    label: "ماتریس ۲×۲",
    preview: "\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}",
    icon: Grid3X3,
    color: "rose",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/40",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/40",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/40",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/40",
  },
};

const inputField =
  "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 text-sm font-english text-gray-900 dark:text-white outline-none transition-all focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 focus:bg-white dark:focus:bg-white/[0.06]";

export default function MathFormulaBuilder({
  onClose,
  onInsert,
}: BuilderProps) {
  const [type, setType] = useState<BuilderType>("fraction");
  const [a, setA] = useState("a");
  const [b, setB] = useState("b");
  const [base, setBase] = useState("b");
  const [argument, setArgument] = useState("x");
  const [lower, setLower] = useState("a");
  const [upper, setUpper] = useState("b");
  const [variable, setVariable] = useState("x");
  const [fn, setFn] = useState("f(x)");
  const [matrix, setMatrix] = useState(["a", "b", "c", "d"]);

  const formula = useMemo(() => {
    switch (type) {
      case "fraction":
        return `\\frac{${a}}{${b}}`;
      case "sqrt":
        return `\\sqrt{${a}}`;
      case "power":
        return `${a}^{${b}}`;
      case "subscript":
        return `${a}_{${b}}`;
      case "log":
        return `\\log_{${base}}(${argument})`;
      case "integral":
        return `\\int_{${lower}}^{${upper}} ${fn}\\,d${variable}`;
      case "sum":
        return `\\sum_{${lower}}^{${upper}} ${a}`;
      case "matrix":
        return `\\begin{pmatrix}${matrix[0]} & ${matrix[1]}\\\\${matrix[2]} & ${matrix[3]}\\end{pmatrix}`;
    }
  }, [type, a, b, base, argument, lower, upper, variable, fn, matrix]);

  const updateMatrix = (index: number, value: string) =>
    setMatrix((current) =>
      current.map((item, i) => (i === index ? value : item)),
    );

  // ✅ این‌ها داخل کامپوننت تعریف می‌شن تا به activeTemplate دسترسی داشته باشن
  const activeTemplate = templates.find((t) => t.id === type) ?? templates[0];
  const activeColor = colorMap[activeTemplate?.color ?? "emerald"];
  const ActiveIcon = activeTemplate.icon;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 animate-[fadeInUp_0.3s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* خط طلایی بالا */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* هاله‌های تزئینی */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col max-h-[92vh]">
          {/* ==================== هدر ==================== */}
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60 animate-pulse" />
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <Calculator size={20} strokeWidth={2.3} />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 mb-0.5">
                  <Wand2 size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Formula Builder
                  </span>
                </div>
                <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                  ساخت فرمول
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  مقادیر رو وارد کن؛ LaTeX خودکار ساخته می‌شه.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* ==================== محتوای اسکرول‌شونده ==================== */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* ==================== قالب‌ها ==================== */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={12} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  قالب فرمول
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 dark:via-white/5 to-transparent" />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-4">
                {templates.map((item) => {
                  const Icon = item.icon;
                  const colors = colorMap[item.color];
                  const isActive = type === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id)}
                      className={`
                        group/tpl relative
                        rounded-2xl border p-3 text-right
                        transition-all duration-300
                        overflow-hidden
                        ${
                          isActive
                            ? `${colors.border} ${colors.bg} shadow-lg`
                            : "border-gray-200 dark:border-white/10 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5"
                        }
                      `}
                    >
                      {/* shine effect */}
                      {!isActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/10 to-transparent -translate-x-full group-hover/tpl:translate-x-full transition-transform duration-700" />
                      )}

                      {/* آیکون */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`
                            inline-flex items-center gap-1.5
                            text-[10px] font-black
                            ${isActive ? colors.text : "text-gray-600 dark:text-gray-400"}
                          `}
                        >
                          <Icon size={11} />
                          {item.label}
                        </span>

                        {isActive && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${colors.text.replace("text-", "bg-")} animate-pulse`}
                          />
                        )}
                      </div>

                      {/* پیش‌نمایش */}
                      <div
                        dir="ltr"
                        className="overflow-hidden text-center text-xs opacity-80"
                      >
                        <MathText content={`$${item.preview}$`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ==================== فیلدهای ورودی ==================== */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FunctionSquare
                  size={12}
                  className="text-[var(--griffin-gold)]"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  مقادیر
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 dark:via-white/5 to-transparent" />
                <span
                  className={`
                    inline-flex items-center gap-1
                    px-2 py-0.5 rounded-md
                    text-[9px] font-black
                    ${activeColor.bg} ${activeColor.text}
                  `}
                >
                  <ActiveIcon size={10} />
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* کسر */}
                {type === "fraction" && (
                  <>
                    <InputField
                      label="صورت"
                      value={a}
                      onChange={setA}
                      placeholder="a"
                    />
                    <InputField
                      label="مخرج"
                      value={b}
                      onChange={setB}
                      placeholder="b"
                    />
                  </>
                )}

                {/* رادیکال */}
                {type === "sqrt" && (
                  <div className="sm:col-span-2">
                    <InputField
                      label="عبارت داخل رادیکال"
                      value={a}
                      onChange={setA}
                      placeholder="x"
                    />
                  </div>
                )}

                {/* توان و اندیس */}
                {(type === "power" || type === "subscript") && (
                  <>
                    <InputField
                      label="پایه"
                      value={a}
                      onChange={setA}
                      placeholder="x"
                    />
                    <InputField
                      label={type === "power" ? "توان" : "اندیس"}
                      value={b}
                      onChange={setB}
                      placeholder="n"
                    />
                  </>
                )}

                {/* لگاریتم */}
                {type === "log" && (
                  <>
                    <InputField
                      label="پایه"
                      value={base}
                      onChange={setBase}
                      placeholder="b"
                    />
                    <InputField
                      label="عبارت"
                      value={argument}
                      onChange={setArgument}
                      placeholder="x"
                    />
                  </>
                )}

                {/* انتگرال و سیگما */}
                {(type === "integral" || type === "sum") && (
                  <>
                    <InputField
                      label="کران پایین"
                      value={lower}
                      onChange={setLower}
                      placeholder="a"
                    />
                    <InputField
                      label="کران بالا"
                      value={upper}
                      onChange={setUpper}
                      placeholder="b"
                    />
                    {type === "integral" ? (
                      <>
                        <InputField
                          label="تابع"
                          value={fn}
                          onChange={setFn}
                          placeholder="f(x)"
                        />
                        <InputField
                          label="متغیر"
                          value={variable}
                          onChange={setVariable}
                          placeholder="x"
                        />
                      </>
                    ) : (
                      <div className="sm:col-span-2">
                        <InputField
                          label="جمله مورد جمع"
                          value={a}
                          onChange={setA}
                          placeholder="a_i"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ماتریس */}
                {type === "matrix" && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                      درایه‌های ماتریس
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {matrix.map((item, index) => (
                        <div key={index} className="relative">
                          <input
                            aria-label={`درایه ${index + 1}`}
                            className={inputField}
                            value={item}
                            onChange={(e) =>
                              updateMatrix(index, e.target.value)
                            }
                          />
                          <span className="absolute top-1 right-2 text-[9px] font-black text-gray-400 tabular-nums">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ==================== پیش‌نمایش ==================== */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye size={12} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  پیش‌نمایش
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 dark:via-white/5 to-transparent" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  زنده
                </span>
              </div>

              <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-50/70 to-white/50 dark:from-white/[0.03] dark:to-white/[0.01] p-5 overflow-hidden">
                {/* هاله تزئینی */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 ${activeColor.bg}`}
                />

                {/* پیش‌نمایش فرمول */}
                <div className="relative min-h-16 flex items-center justify-center overflow-x-auto px-3 py-4">
                  <MathText content={`$$${formula}$$`} />
                </div>

                {/* نمایش LaTeX */}
                <div className="relative mt-4 pt-4 border-t border-gray-200/50 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={10} className="text-[var(--griffin-gold)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                      LaTeX Code
                    </span>
                  </div>
                  <p
                    className="text-left text-xs font-english text-gray-500 dark:text-gray-400 break-all leading-6 px-2 py-2 rounded-lg bg-white/60 dark:bg-black/30"
                    dir="ltr"
                  >
                    {formula}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== فوتر (دکمه‌ها) ==================== */}
          <div className="flex items-center justify-end gap-3 p-5 pt-4 border-t border-gray-200/70 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-5 py-3 text-sm font-black text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={() => onInsert(formula)}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Check size={16} strokeWidth={3} />
                درج در متن
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Input Field Component ====================
const InputField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </span>
    <input
      className={inputField}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir="ltr"
    />
  </label>
);
